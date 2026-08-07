/**
 * 🎯 @KICK  : check_license_session Supabase RPC를 서버단 API Route로 대체
 * 🚨 @PATCH : 2026-07-22 — supabase.rpc('check_license_session') 클라이언트 직접 호출을 서버단 postgres.js 쿼리로 이전
 *             license_activations 테이블 직접 조회 방식으로 대체 (RPC 의존성 제거)
 */
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
    const subRows = await sql`
      SELECT id, max_devices
      FROM subscriptions
      WHERE payment_no = ${p_payment_no}
        AND (is_active = true OR UPPER(plan_status) = 'FREE')
        AND UPPER(plan_status) IN ('ACTIVE', 'FREE')
      LIMIT 1
    `;

    if (!subRows || subRows.length === 0) {
      return NextResponse.json({ success: true, has_session: false, max_devices: 0 });
    }

    const { id: licenseId, max_devices } = subRows[0];

    // 2. license_activations에서 해당 device_uuid 세션 존재 여부 확인 (활성화/제한 여부 모두 조회)
    const actRows = await sql`
      SELECT id, is_active
      FROM license_activations
      WHERE subscription_id = ${licenseId}
        AND device_uuid = ${p_device_uuid}
      LIMIT 1
    `;

    const sessionExists = actRows && actRows.length > 0;
    const isActiveSession = sessionExists && actRows[0].is_active;

    // 3. updated_at 갱신 (제한 사용자라도 세션(브라우저)이 존재하면 하트비트 적재 유지)
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
      has_session: isActiveSession, // 제한 사용자에게는 false를 반환하여 프론트가 계속 제한 상태를 유지하도록 함
      is_restricted: sessionExists && !isActiveSession,
      max_devices: max_devices || 1
    });
  } catch (error: any) {
    console.error('[/api/license/check-session] Error:', error);
    return NextResponse.json({ success: false, has_session: false, message: error.message }, { status: 500 });
  }
}
