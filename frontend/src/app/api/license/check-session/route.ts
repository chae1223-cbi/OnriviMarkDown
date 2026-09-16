// ====================================================================
// 📊 [OMD-API-checkSession-0001 ✅ FIXED] /api/license/check-session
// 🎯 @KICK  : 웹 및 데스크탑 세션 생존(Heartbeat) 확인 및 타 기기 해제 감지
// 🛡️ @GUARD : Rule 1, Rule 2, 임의 한도 조작 금지, 세션 삭제/비활성화 즉각 감지
// 🚨 @PATCH : **2026-09-16** — [하트비트 임의 한도 동기화 금지 및 세션 해제 캐치 보강]: 하트비트에서 1대 한도를 임의 동기화하거나 승급하지 않고, DB 실제 상태(삭제/비활성화)를 충실히 전달하여 타 기기에서 해제된 세션을 클라이언트가 즉시 캐치하여 끊을 수 있도록 is_terminated 및 실제 max_devices 반환
// ====================================================================
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_payment_no, p_device_uuid } = body;

    if (!p_payment_no || !p_device_uuid) {
      return NextResponse.json({ success: false, has_session: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    // 1. payment_no -> subscriptions -> license_id 조회
    // 🚨 @PATCH : plan_status가 EXPIRED 인 경우도 우선 검색하여 제한사용자 여부를 판단할 수 있도록 쿼리 완화
    const subRows = await sql`
      SELECT id, max_devices, plan_status
      FROM subscriptions
      WHERE payment_no = ${p_payment_no}
      LIMIT 1
    `;

    if (!subRows || subRows.length === 0) {
      return NextResponse.json({ success: true, has_session: false, is_restricted: true, is_terminated: true, max_devices: 0 });
    }

    const { id: licenseId, max_devices, plan_status } = subRows[0];
    const isExpiredPlan = plan_status === 'EXPIRED';

    // 2. license_activations에서 해당 device_uuid 세션 존재 여부 확인 (활성 및 제한 모두 조회)
    const actRows = await sql`
      SELECT id, is_active
      FROM license_activations
      WHERE subscription_id = ${licenseId}
        AND device_uuid = ${p_device_uuid}
      LIMIT 1
    `;

    const sessionExists = actRows && actRows.length > 0;
    
    // 강제 만료된 플랜이면 무조건 활성화 안된 세션으로 취급
    const isActiveSession = isExpiredPlan ? false : (sessionExists && actRows[0].is_active);

    // 3. updated_at 갱신 (세션이 존재할 때만 생존 신호 갱신)
    if (sessionExists) {
      await sql`
        UPDATE license_activations
        SET updated_at = now()
        WHERE subscription_id = ${licenseId}
          AND device_uuid = ${p_device_uuid}
      `;
    }

    return NextResponse.json({
      success: true,
      has_session: isActiveSession, // 제한 사용자에게는 false를 반환하여 프론트가 계속 제한 상태로 두도록 함
      is_restricted: isExpiredPlan ? true : (sessionExists && !isActiveSession),
      is_terminated: !sessionExists,
      max_devices: max_devices || 1
    });
  } catch (error: any) {
    console.error('[/api/license/check-session] Error:', error);
    return NextResponse.json({ success: false, has_session: false, message: error.message }, { status: 500 });
  }
}

