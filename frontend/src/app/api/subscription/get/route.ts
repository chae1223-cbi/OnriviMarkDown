import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    let { user_id: userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'user_id 파라미터가 필요합니다.' }, { status: 400 });
    }

    // UUID가 아닌 경우 (예: onrivi@naver.com) users 테이블에서 UUID를 찾는다
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isValidUUID(userId)) {
      const { data: userRow } = await supabaseAdmin.from('users').select('id').eq('email', userId).limit(1).single();
      if (userRow && userRow.id) {
        userId = userRow.id;
      } else {
        return NextResponse.json({ success: false, message: '해당 이메일의 사용자를 찾을 수 없습니다.' }, { status: 404 });
      }
    }

    const nowIso = new Date().toISOString();

    // 0. 현재 날짜 기준으로 만료일이 지난 활성 구독을 자동으로 EXPIRED 처리
    await supabaseAdmin.from('subscriptions')
      .update({ plan_status: 'EXPIRED', is_active: false, updated_at: nowIso })
      .eq('user_id', userId)
      .lt('current_period_end', nowIso)
      .neq('plan_status', 'EXPIRED');

    // 1. 전체 구독 이력 및 공통 코드 조회
    const [ { data: subs }, { data: codes } ] = await Promise.all([
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabaseAdmin.from('common_codes').select('group_code, code_value, code_name')
    ]);

    let rawSubs: any[] = subs || [];

    // 2. 신규 유저(구독 없음) 자동 14일 무료 체험(APPRENTICE) 발급
    if (!rawSubs || rawSubs.length === 0) {
      const trialPaymentNo = 'TRIAL-' + Date.now();
      const trialLicenseKey = 'TRIAL-' + Math.random().toString(36).substring(2, 15).toUpperCase();
      const trialVerifyKey = Math.random().toString(36).substring(2, 15).toUpperCase();
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const { data: newTrial } = await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        plan_name: 'APPRENTICE',
        plan_status: 'ACTIVE',
        billing_cycle: 'TRIAL',
        is_active: true,
        max_devices: 1,
        price_amount: 0,
        current_period_start: nowIso,
        current_period_end: trialEnd,
        payment_no: trialPaymentNo,
        license_key: trialLicenseKey,
        verify_key: trialVerifyKey
      }).select();

      if (newTrial && newTrial.length > 0) {
        rawSubs = [newTrial[0]];
      }
    } else {
      const hasApprenticeHistory = rawSubs.some((s: any) => (s.plan_name || '').toUpperCase() === 'APPRENTICE');
      const hasActiveSub = rawSubs.some((s: any) => s.is_active && ((s.plan_status || '').toUpperCase() === 'ACTIVE' || (s.plan_status || '').toUpperCase() === 'FREE'));

      // 기존 단독 READER 계정 중 Apprentice 미경험자는 14일 체험 승급
      if (!hasApprenticeHistory && rawSubs.length === 1 && rawSubs[0].plan_name === 'READER') {
        const trialPaymentNo = 'TRIAL-' + Date.now();
        const trialLicenseKey = 'TRIAL-' + Math.random().toString(36).substring(2, 15).toUpperCase();
        const trialVerifyKey = Math.random().toString(36).substring(2, 15).toUpperCase();
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        const { data: updatedTrial } = await supabaseAdmin.from('subscriptions').update({
          plan_name: 'APPRENTICE',
          plan_status: 'ACTIVE',
          billing_cycle: 'TRIAL',
          is_active: true,
          price_amount: 0,
          current_period_start: nowIso,
          current_period_end: trialEnd,
          payment_no: trialPaymentNo,
          license_key: trialLicenseKey,
          verify_key: trialVerifyKey,
          updated_at: nowIso
        }).eq('id', rawSubs[0].id).select();

        if (updatedTrial && updatedTrial.length > 0) {
          rawSubs[0] = updatedTrial[0];
        }
      } else if (!hasActiveSub) {
        // 14일 무료 체험(Apprentice) 또는 유료 구독 만료 후 활성 구독이 없는 경우 DB에 자동으로 READER 등급 발급
        const readerPaymentNo = 'READER-' + Date.now();
        const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15).toUpperCase();
        const readerVerifyKey = Math.random().toString(36).substring(2, 15).toUpperCase();

        const { data: newReader } = await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          plan_name: 'READER',
          plan_status: 'ACTIVE',
          billing_cycle: 'FREE',
          is_active: true,
          max_devices: 1,
          price_amount: 0,
          current_period_start: nowIso,
          current_period_end: '9999-12-31T23:59:59.000Z',
          payment_no: readerPaymentNo,
          license_key: readerLicenseKey,
          verify_key: readerVerifyKey
        }).select();

        if (newReader && newReader.length > 0) {
          rawSubs.unshift(newReader[0]);
        }

        const expiredSubIds = rawSubs.filter((s: any) => s.plan_status === 'EXPIRED').map((s: any) => s.id);
        if (expiredSubIds.length > 0) {
          await supabaseAdmin.from('license_activations')
            .update({ is_active: false, updated_at: nowIso })
            .in('subscription_id', expiredSubIds)
            .eq('is_active', true);
        }
      }
    }

    let allSubs = rawSubs.map((s: any) => {
      const planCode = codes?.find((c: any) => c.group_code === 'PLAN_NAME' && c.code_value.toUpperCase() === s.plan_name?.toUpperCase());
      const cycleCode = codes?.find((c: any) => c.group_code === 'BILLING_CYCLE' && c.code_value.toUpperCase() === s.billing_cycle?.toUpperCase());
      const statusCode = codes?.find((c: any) => c.group_code === 'PLAN_STATUS' && c.code_value.toUpperCase() === s.plan_status?.toUpperCase());
      
      return {
        ...s,
        plan_name_kr: planCode ? planCode.code_name : s.plan_name,
        billing_cycle_kr: cycleCode ? cycleCode.code_name : s.billing_cycle,
        plan_status_kr: statusCode ? statusCode.code_name : s.plan_status
      };
    });

    // 2. 현재 활성 구독(is_active = true 및 ACTIVE 또는 FREE) 탐색, 없으면 최신 레코드 반환
    const activeSub = allSubs.find((s: any) => (s.is_active && s.plan_status?.toUpperCase() === 'ACTIVE') || s.plan_status?.toUpperCase() === 'FREE');
    const latestSub = activeSub || allSubs[0]; // 무조건 최근 구독 기록 반환

    // 3. 활성 구독 ID에 대응하는 기기 접속 세션 전체 조회 (license_activations)
    const activeSubIds = allSubs
      .filter((s: any) => s.plan_status?.toUpperCase() === 'ACTIVE' || s.plan_status?.toUpperCase() === 'FREE')
      .map((s: any) => s.id);
    const validSubIds = activeSubIds.length > 0 ? activeSubIds : [latestSub?.id].filter(Boolean);

    let activations: any[] = [];
    if (validSubIds.length > 0) {
      const { data: actData } = await supabaseAdmin.from('license_activations')
        .select('id, subscription_id, device_uuid, device_name, activated_at, updated_at, is_active')
        .in('subscription_id', validSubIds)
        .order('activated_at', { ascending: false });
      
      activations = (actData || []).map((a: any) => ({
        ...a,
        license_id: a.subscription_id // 하위 호환성 유지
      }));
    }

    const mappedDevices = (activations || []).map(device => {
      const matchedSub = allSubs.find((s: any) => s.id === device.license_id);
      return {
        ...device,
        payment_no: matchedSub?.payment_no || '',
        is_active_license: latestSub ? matchedSub?.id === latestSub.id : false
      };
    });

    return NextResponse.json({
      success: true,
      subscription: latestSub ? {
        ...latestSub,
        // 사용자에게 반환한 모든 활성 구독의 웹 편집 세션만 집계한다.
        active_device_count: mappedDevices.filter((device: any) => device.is_active === true && ['web saas', 'web browser'].includes((device.device_name || '').trim().toLowerCase()) && Date.now() - new Date(device.updated_at || device.activated_at).getTime() < 2 * 60 * 1000).length
      } : null,
      devices: mappedDevices,
      historyList: allSubs,
      license: latestSub ? {
        id: latestSub.id,
        license_key: latestSub.license_key || '',
        verify_key: latestSub.verify_key || '',
        payment_no: latestSub.payment_no || ''
      } : null
    });
  } catch (error: any) {
    console.error('[/api/subscription/get] 오류:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
