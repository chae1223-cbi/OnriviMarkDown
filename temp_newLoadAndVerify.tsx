  const loadAndVerifyLicense = useCallback(async () => {
    if (typeof window === 'undefined' || !deviceId) return;
    const api = (window as any).electronAPI;
    const isDesktop = !!api;
    let savedKey = '';
    let savedPaymentNo = '';
    let savedUserId = '';
    let savedLastRunTime = 0;

    // A. 스토리지 로드 (웹/데스크탑 분리)
    if (isDesktop) {
      if (typeof api.loadLicenseFull === 'function') {
        const fullData = await api.loadLicenseFull();
        if (fullData) {
          savedUserId = fullData.userId || '';
          savedLastRunTime = fullData.lastRunTime || 0;
        }
      }
    } else {
      const chromeStorage = (window as any).chrome?.storage?.local;
      if (chromeStorage) {
        const result = await new Promise<any>((resolve) => {
          chromeStorage.get(['onrivi_license_key', 'onrivi_user_id', 'onrivi_payment_no', 'onrivi_last_run_time'], resolve);
        });
        savedKey = result.onrivi_license_key || '';
        savedUserId = result.onrivi_user_id || '';
        savedPaymentNo = result.onrivi_payment_no || '';
        savedLastRunTime = result.onrivi_last_run_time || 0;
      } else {
        savedKey = localStorage.getItem('onrivi_license_key') || '';
        savedUserId = localStorage.getItem('onrivi_user_id') || '';
        savedPaymentNo = localStorage.getItem('onrivi_payment_no') || '';
        savedLastRunTime = parseInt(localStorage.getItem('onrivi_last_run_time') || '0', 10);
      }
    }

    const nowTime = Date.now();

    // B. 시간 조작 가드
    if (savedLastRunTime > 0 && nowTime < savedLastRunTime) {
      showToast("⚠️ 로컬 시스템 시간 조작이 감지되었습니다. 에디터 편집 기능이 제한됩니다.", "error");
      setLicenseStatus(prev => ({
        ...prev, isActivated: false, isExpired: true, planName: '시간 역전 제한 모드'
      }));
      return;
    }

    // ============================================
    // 🚨 데스크탑 전용 로직: 무조건 DB 조회 (USERID + DeviceID)
    // ============================================
    if (isDesktop) {
      // 시스템 실행 시간 및 USERID만 갱신 (결제번호 등은 캐시하지 않음)
      if (typeof api.saveLicenseFull === 'function') {
        await api.saveLicenseFull({ userId: savedUserId, lastRunTime: nowTime });
      }

      if (!savedUserId) {
        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: '', licenseKey: '', paymentNo: '',
          planName: '미인증 라이선스', nextPaymentDate: ''
        });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('verify_desktop_license', {
          p_email: savedUserId,
          p_device_uuid: deviceId
        });

        if (error || !data || !data.success) {
          console.warn('[loadAndVerifyLicense] Desktop verification failed:', error || data?.message);
          setLicenseStatus({
            isActivated: false, isExpired: true, remainingDays: 0,
            userId: savedUserId, licenseKey: '', paymentNo: '',
            planName: '미인증 라이선스', nextPaymentDate: ''
          });
        } else {
          const expiryMs = data.next_payment_date ? new Date(data.next_payment_date).getTime() : 0;
          const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
          
          setLicenseStatus({
            isActivated: true, isExpired: false, remainingDays,
            userId: savedUserId, licenseKey: data.license_key || '', paymentNo: '',
            planName: data.plan_name || '프리미엄 요금제',
            nextPaymentDate: data.next_payment_date || data.trial_end_at || ''
          });
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] Desktop DB error:', err);
        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: savedUserId, licenseKey: '', paymentNo: '',
          planName: '미인증 라이선스 (네트워크 오류)', nextPaymentDate: ''
        });
      }
      return; // 데스크탑은 여기서 검증 완전 종료!
    }

    // ============================================
    // ── 웹 SaaS 전용 기존 로직 ──
    // ============================================
    if (!savedPaymentNo) {
      savedKey = '';
      savedUserId = '';
      savedPaymentNo = '';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userSub } = await supabase
            .from('subscriptions')
            .select('id, plan_name, plan_status, trial_end_at, current_period_end, max_devices')
            .eq('user_id', session.user.id)
            .in('plan_status', ['ACTIVE', 'FREE'])
            .order('current_period_end', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (userSub) {
            const { data: userLic } = await supabase
              .from('software_licenses')
              .select('license_key, payment_no')
              .eq('subscription_id', userSub.id)
              .maybeSingle();
            if (userLic?.payment_no) {
              savedPaymentNo = userLic.payment_no;
              savedKey = userLic.license_key || '';
              savedUserId = session.user.id;
            }
          }
        }
      } catch (e) {
        console.warn('[loadAndVerifyLicense] user_id fallback failed:', e);
      }
    }

    const chromeStorage = (window as any).chrome?.storage?.local;
    if (chromeStorage) {
      chromeStorage.set({
        onrivi_license_key: savedKey, onrivi_user_id: savedUserId,
        onrivi_payment_no: savedPaymentNo, onrivi_last_run_time: nowTime
      });
    }
    localStorage.setItem('onrivi_license_key', savedKey);
    localStorage.setItem('onrivi_user_id', savedUserId);
    localStorage.setItem('onrivi_payment_no', savedPaymentNo);
    localStorage.setItem('onrivi_last_run_time', nowTime.toString());

    if (!savedKey) savedKey = '';
    setLicenseKey(savedKey);

    if (savedPaymentNo) {
      try {
        let sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem('onrivi_session_id', sessionId);
        }

        const { data: lic } = await supabase
          .from('software_licenses')
          .select('id, subscription_id')
          .eq('payment_no', savedPaymentNo)
          .maybeSingle();

        if (!lic) {
          console.warn('[loadAndVerifyLicense] web: license not found for payment_no');
        } else {
          const { data: license } = await supabase
            .from('software_licenses')
            .select('id, is_active, license_key, payment_no, subscription_id')
            .eq('id', lic.id)
            .eq('payment_no', savedPaymentNo)
            .maybeSingle();

          if (license) {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('plan_name, plan_status, trial_end_at, current_period_end, max_devices')
              .eq('id', lic.subscription_id)
              .maybeSingle();

            let expiryMs = 0;
            if (sub) {
              const targetDate = sub.current_period_end || sub.trial_end_at;
              if (targetDate) expiryMs = new Date(targetDate).getTime();
            }
            
            let isExpired = expiryMs === 0 ? true : (Date.now() > expiryMs);
            const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
            const isFreeTrial = sub?.plan_name === 'FREE' || savedPaymentNo.startsWith('FREE_TRIAL_');
            const planName = isFreeTrial ? '무료 체험판 플랜' : `${sub?.plan_name || 'PRO'} 프리미엄 플랜`;

            const { data: actResult } = await supabase.rpc('insert_license_activation', {
              p_license_id: license.id, p_device_uuid: sessionId, p_device_name: 'Web SaaS'
            });
            if (actResult && !actResult.success) isExpired = true;

            const { data: chk2 } = await supabase.rpc('check_license_session', { p_payment_no: savedPaymentNo, p_device_uuid: sessionId });
            if (chk2 && chk2.success && chk2.active_count > chk2.max_devices) isExpired = true;

            const isActivated = !isExpired;

            setLicenseStatus({
              isActivated, isExpired, remainingDays, userId: savedUserId,
              licenseKey: isActivated ? savedKey : '', paymentNo: savedPaymentNo || license.payment_no || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : '')
            });

            saveSecureData('onrivi_license_status', {
              isActivated, isExpired, remainingDays, userId: savedUserId,
              licenseKey: isActivated ? savedKey : '', paymentNo: savedPaymentNo || license.payment_no || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : ''),
              lastVerifiedAt: Date.now()
            });
            return;
          }
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] web unexpected error:', err);
      }
    }

    const cached = loadSecureData<any>('onrivi_license_status');
    if (cached && cached.licenseKey === savedKey && cached.userId === savedUserId) {
      const elapsedSinceVerify = Date.now() - (cached.lastVerifiedAt || 0);
      if (elapsedSinceVerify < 3 * 24 * 60 * 60 * 1000) {
        setLicenseStatus({
          isActivated: cached.isActivated, isExpired: cached.isExpired, remainingDays: cached.remainingDays,
          userId: cached.userId, licenseKey: cached.isActivated ? cached.licenseKey : '',
          paymentNo: cached.paymentNo || '', planName: cached.planName || '오프라인 캐시 모드',
          nextPaymentDate: cached.nextPaymentDate
        });
        return;
      }
    }

    setLicenseStatus({
      isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
      licenseKey: savedKey || cached?.licenseKey || '', paymentNo: savedPaymentNo,
      planName: cached?.planName || (savedPaymentNo ? '프리미엄 요금제' : '미인증 라이선스'),
      nextPaymentDate: cached?.nextPaymentDate || (savedPaymentNo ? '-' : undefined)
    });
  }, [deviceId, showToast]);
