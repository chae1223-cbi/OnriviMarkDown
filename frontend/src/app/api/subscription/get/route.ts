import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { user_id: userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'user_id 파라미터가 필요합니다.' }, { status: 400 });
    }

    // 1. 전체 구독 이력 조회 (활성, 만료, 취소 상관없이 최신순 전체)
    const allSubs = await sql`
      SELECT 
        s.id, s.user_id, s.plan_name, s.plan_status, s.billing_cycle,
        s.license_key, s.verify_key, s.payment_no, s.max_devices,
        s.current_period_start, s.current_period_end, s.is_active, s.created_at,
        COALESCE(c_plan.code_name, s.plan_name) AS plan_name_kr,
        COALESCE(c_cycle.code_name, s.billing_cycle) AS billing_cycle_kr,
        COALESCE(c_status.code_name, s.plan_status) AS plan_status_kr
      FROM subscriptions s
      LEFT JOIN common_codes c_plan ON c_plan.group_code = 'PLAN_NAME' AND UPPER(c_plan.code_value) = UPPER(s.plan_name)
      LEFT JOIN common_codes c_cycle ON c_cycle.group_code = 'BILLING_CYCLE' AND UPPER(c_cycle.code_value) = UPPER(s.billing_cycle)
      LEFT JOIN common_codes c_status ON c_status.group_code = 'PLAN_STATUS' AND UPPER(c_status.code_value) = UPPER(s.plan_status)
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `;

    if (!allSubs || allSubs.length === 0) {
      return NextResponse.json({
        success: true,
        subscription: null,
        historyList: [],
        license: null,
        devices: []
      });
    }

    // 2. 현재 활성 구독(is_active = true 및 ACTIVE) 탐색, 없으면 최신 레코드
    const activeSub = allSubs.find(s => s.is_active && s.plan_status?.toUpperCase() === 'ACTIVE') || allSubs[0];
    const latestSub = (activeSub && activeSub.is_active && activeSub.plan_status?.toUpperCase() === 'ACTIVE') ? activeSub : null;

    // 3. 모든 구독 ID에 대응하는 기기 접속 세션 전체 조회 (license_activations)
    const subIds = allSubs.map(s => s.id);
    const activations = await sql`
      SELECT id, subscription_id as license_id, device_uuid, device_name, activated_at
      FROM license_activations
      WHERE subscription_id = ANY(${subIds})
      ORDER BY activated_at DESC
    `;

    const mappedDevices = (activations || []).map(device => {
      const matchedSub = allSubs.find(s => s.id === device.license_id);
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
