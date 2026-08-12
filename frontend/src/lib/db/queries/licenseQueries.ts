/**
 * 프로그램명 : 라이선스 활성화 쿼리 유틸 (licenseQueries.ts)
 * 버전 정보 : 1.0.0
 * 프로그램 ID : oaar-license-queries-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.07.05> 최초작성
 *   * 🚨 @PATCH : **2026-08-12** — 기기 재접속 시 동시접속 한도 검사를 우회하여 제한사용자가 정품으로 뚫리는 버그 수정을 위해 checkLimits 시 본인 세션을 제외하고 세는 로직 도입 및 !isCurrentlyActive 우회 가드 해제 적용
 * -----------------------------------------------------------------------
 */
export const insertLicenseActivationQuery = async (db: any, licenseId: string, deviceUuid: string, deviceName: string, userId: string | null = null, isExpired: boolean = false) => {
  return db.begin(async (tx: any) => {
    // 1. 해당 구독(subscriptions) 정보 조회
    const licenseInfo = await tx`
      SELECT max_devices, plan_name
      FROM subscriptions
      WHERE id = ${licenseId}
    `;

    if (licenseInfo.length === 0) {
      throw new Error('구독/라이선스 정보를 찾을 수 없습니다.');
    }

    const { max_devices, plan_name } = licenseInfo[0];

    const checkLimits = async () => {
      if (max_devices !== null && max_devices > 0) {
        const activeSessions = await tx`
          SELECT id, device_name, activated_at
          FROM license_activations
          WHERE subscription_id = ${licenseId} 
            AND is_active = true
            AND device_uuid != ${deviceUuid} -- 💡 본인 기기 세션은 카운트에서 제외하여 오판 방지
          ORDER BY activated_at ASC
        `;
        
        const isElitePro = plan_name?.toUpperCase().replace(/\s/g, '').includes('ELITE');
        const isDesktopReq = deviceName?.toLowerCase().includes('desktop');

        if (isElitePro) {
          const desktopSessions = activeSessions.filter((s: any) => s.device_name?.toLowerCase().includes('desktop'));
          const webSessions = activeSessions.filter((s: any) => !s.device_name?.toLowerCase().includes('desktop'));
          
          if (isDesktopReq && desktopSessions.length >= 1) {
            return false;
          } else if (!isDesktopReq && webSessions.length >= 1) {
            return false;
          }
        } else {
          if (activeSessions.length >= max_devices) {
            return false;
          }
        }
      }
      return true;
    };

    // 2. 기존 동일 기기 세션 확인
    const currentDeviceRes = await tx`
      SELECT is_active
      FROM license_activations
      WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
    `;
    
    let isCurrentlyActive = false;
    let newIsActive = true;

    // 1차 필터: READER 요금제이거나 명시적 만료 상태면 무조건 제한 사용자(is_active = false)
    if (isExpired || plan_name?.toUpperCase() === 'READER') {
      newIsActive = false;
    }

    if (currentDeviceRes.length > 0) {
      isCurrentlyActive = currentDeviceRes[0].is_active;
      
      // 3. max_devices 제한 검사 (1차 필터 통과 시 isCurrentlyActive 상태에 관계없이 무조건 항상 검사)
      if (newIsActive) {
        newIsActive = await checkLimits();
      }
      // 이미 활성이면서 1차 필터 통과(newIsActive===true)면 계속 true 유지 (checkLimits 생략)

      // 기존 기록 UPDATE (DELETE 후 INSERT 하면 Supabase Realtime DELETE 이벤트가 발생해 다른 탭이 강제 로그아웃됨)
      await tx`
        UPDATE license_activations
        SET activated_at = now(), updated_at = now(), is_active = ${newIsActive}, device_name = ${deviceName}
        WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
      `;
    } else {
      // 3. max_devices 제한 검사 (완전 신규 기기, 1차 필터 통과시에만)
      if (newIsActive) {
        newIsActive = await checkLimits();
      }

      // 4. 신규 세션 등록
      if (userId) {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, created_by, updated_by, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${userId}, ${userId}, ${newIsActive})
        `;
      } else {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${newIsActive})
        `;
      }
    }

    if (!newIsActive) {
      return { success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하거나 만료(READER)되어 제한 모드로 연결됩니다.', max_devices };
    }

    return { success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.' };
  });
};
