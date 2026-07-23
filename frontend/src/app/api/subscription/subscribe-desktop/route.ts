/**
 * 🎯 @KICK  : subscribe_desktop_plan Supabase RPC를 서버단 API Route로 대체
 * 🚨 @PATCH : 2026-07-22 — supabase.rpc('subscribe_desktop_plan') 제거 및 네이티브 DML(insert/update)로 로직 전면 이관
 *             subscriptions 단일 테이블 구조에 맞게 서버 코드단에서 라이선스 키 생성 및 삽입 처리
 */
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

function generateHex(size: number) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_user_id, p_device_uuid, p_device_name } = body;

    if (!p_user_id || !p_device_uuid) {
      return NextResponse.json({ success: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const periodEndTs = new Date(Date.now() + 365 * 86400000).toISOString();

    const subId = crypto.randomUUID();
    const licenseKey = `OMD-${generateHex(4)}-${generateHex(4)}`;
    const verifyKey = generateHex(8);
    const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateHex(4)}`;

    await sql.begin(async (tx) => {
      // 1. 기존 구독 만료 처리
      await tx`
        UPDATE subscriptions
        SET plan_status = 'EXPIRED', is_active = false, updated_at = now()
        WHERE user_id = ${p_user_id}
      `;

      // 2. 신규 데스크탑 구독 생성
      await tx`
        INSERT INTO subscriptions (
          id, created_by, updated_by, user_id, plan_name, plan_status, billing_cycle,
          license_key, verify_key, payment_no, max_devices,
          current_period_start, current_period_end, is_active, created_at, updated_at
        ) VALUES (
          ${subId}, ${p_user_id}, ${p_user_id}, ${p_user_id}, 'ELITEPRO', 'ACTIVE', 'YEARLY',
          ${licenseKey}, ${verifyKey}, ${paymentNo}, 2,
          now(), ${periodEndTs}::timestamptz, true, now(), now()
        )
      `;

      // 3. 기기 활성화
      await tx`
        INSERT INTO license_activations (
          subscription_id, device_uuid, device_name, activated_at, is_active, created_by, updated_by
        ) VALUES (
          ${subId}, ${p_device_uuid}, ${p_device_name || 'Desktop App'}, now(), true, ${p_user_id}, ${p_user_id}
        )
      `;
    });

    return NextResponse.json({
      success: true,
      message: '데스크탑 구독이 활성화되었습니다.',
      license_key: licenseKey,
      verify_key: verifyKey,
      payment_no: paymentNo,
      subscription_id: subId,
    });
  } catch (error: any) {
    console.error('[/api/subscription/subscribe-desktop] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
