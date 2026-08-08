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

    let allSubs = (subs || []).map((s: any) => {
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

    // 2. 과거 결제 내역(구독)이 아예 없는 신규 유저라면 즉시 READER 요금제 자동 발급
    if (!allSubs || allSubs.length === 0) {
      const readerPaymentNo = 'READER-' + Date.now();
      const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15);
      const newStartDateStr = new Date().toISOString();

      const { data: newReader } = await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        plan_name: 'READER',
        plan_status: 'ACTIVE',
        is_active: true,
        max_devices: 1,
        current_period_start: newStartDateStr,
        current_period_end: '9999-12-31T23:59:59.000Z',
        payment_no: readerPaymentNo,
        license_key: readerLicenseKey
      }).select();

      if (newReader && newReader.length > 0) {
        allSubs = [{
          ...newReader[0],
          plan_name_kr: '제한 사용자 (읽기 전용)',
          plan_status_kr: '활성'
        }] as any;
      }
    }

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
        .select('id, subscription_id, device_uuid, device_name, activated_at, is_active')
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
        active_device_count: mappedDevices.length || 1
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

