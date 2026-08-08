import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    let { user_id: userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'user_id 파라미터가 필요합니다.' }, { status: 400 });
    }

    // UUID가 아닌 경우 (예: onrivi@naver.com) users 테이블에서 UUID를 찾는다
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isValidUUID(userId)) {
      const userRow = await sql`SELECT id FROM users WHERE email = ${userId} LIMIT 1`;
      if (userRow && userRow.length > 0) {
        userId = userRow[0].id;
      } else {
        return NextResponse.json({ success: false, message: '해당 이메일의 사용자를 찾을 수 없습니다.' }, { status: 404 });
      }
    }

    // 0. 현재 날짜 기준으로 만료일이 지난 활성 구독을 자동으로 EXPIRED 처리
    await sql`
      UPDATE subscriptions
      SET plan_status = 'EXPIRED',
          is_active = false,
          updated_at = now()
      WHERE user_id = ${userId}
        AND current_period_end < now()
        AND plan_status != 'EXPIRED'
    `;

    // 1. 전체 구독 이력 조회 (활성, 만료, 취소 상관없이 최신순 전체)
    let allSubs = await sql`
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

    // 2. 과거 결제 내역(구독)이 아예 없는 신규 유저라면 즉시 READER 요금제 자동 발급
    if (!allSubs || allSubs.length === 0) {
      const readerPaymentNo = 'READER-' + Date.now();
      const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15);
      const newStartDateStr = new Date().toISOString();

      const newReader = await sql`
        INSERT INTO subscriptions (
          user_id, plan_name, plan_status, is_active, max_devices, 
          current_period_start, current_period_end, created_at, updated_at,
          payment_no, license_key
        ) VALUES (
          ${userId}, 'READER', 'ACTIVE', true, 1,
          ${newStartDateStr}, '9999-12-31T23:59:59.000Z', now(), now(),
          ${readerPaymentNo}, ${readerLicenseKey}
        )
        RETURNING *
      `;

      if (newReader && newReader.length > 0) {
        // 새로 생성된 READER 구독을 배열에 넣어 이후 로직이 동일하게 처리되도록 함
        allSubs = [{
          ...newReader[0],
          plan_name_kr: '제한 사용자 (읽기 전용)',
          plan_status_kr: '활성'
        }] as any;
      }
    }

    // 2. 현재 활성 구독(is_active = true 및 ACTIVE 또는 FREE) 탐색, 없으면 최신 레코드 반환
    const activeSub = allSubs.find(s => (s.is_active && s.plan_status?.toUpperCase() === 'ACTIVE') || s.plan_status?.toUpperCase() === 'FREE');
    const latestSub = activeSub || allSubs[0]; // 무조건 최근 구독 기록 반환

    // 3. 활성 구독 ID에 대응하는 기기 접속 세션 전체 조회 (license_activations)
    // 과거 만료/취소된 구독의 세션은 사용자에게 혼란을 주므로 숨김 처리
    const activeSubIds = allSubs
      .filter(s => s.plan_status?.toUpperCase() === 'ACTIVE' || s.plan_status?.toUpperCase() === 'FREE')
      .map(s => s.id);
    const validSubIds = activeSubIds.length > 0 ? activeSubIds : [latestSub?.id].filter(Boolean);

    let activations: any[] = [];
    if (validSubIds.length > 0) {
      activations = await sql`
        SELECT id, subscription_id as license_id, device_uuid, device_name, activated_at, is_active
        FROM license_activations
        WHERE subscription_id = ANY(${validSubIds})
        ORDER BY activated_at DESC
      `;
    }

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
