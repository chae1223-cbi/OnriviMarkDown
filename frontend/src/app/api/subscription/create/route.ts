import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      p_user_id,
      p_plan_name,
      p_plan_status,
      p_billing_interval,
      p_max_devices,
      p_period_end,
      p_plan_end_date,
      p_today_str,
      p_device_uuid,
      p_device_name,
    } = body;

    if (!p_user_id || !p_plan_name || !p_device_uuid) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const result = await sql.begin(async (tx) => {
      // 1. 기존 활성 구독이 있으면 해지
      await tx`
        UPDATE subscriptions
        SET plan_status = 'CANCELED',
            is_expired = 'Y',
            plan_end_date = ${p_today_str}
        WHERE user_id = ${p_user_id}
          AND is_expired = 'N'
      `;

      // 2. 구독 생성
      const subId = crypto.randomUUID();
      const periodEndTs = `${p_period_end.substring(0, 4)}-${p_period_end.substring(4, 6)}-${p_period_end.substring(6, 8)}T23:59:59Z`;

      await tx`
        INSERT INTO subscriptions (
          id, user_id, plan_name, plan_status, billing_interval,
          max_devices, current_period_end, plan_start_date,
          is_expired, plan_end_date, created_at
        ) VALUES (
          ${subId}, ${p_user_id}, ${p_plan_name}, ${p_plan_status}, ${p_billing_interval},
          ${p_max_devices}, ${periodEndTs}::timestamptz, ${p_today_str},
          'N', ${p_plan_end_date}, now()
        )
      `;

      // 3. 라이선스 생성
      const licId = crypto.randomUUID();
      const licenseKey = crypto.randomBytes(8).toString('hex').toUpperCase();
      const verifyKey = crypto.randomBytes(8).toString('hex').toUpperCase();
      const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const isActive = p_plan_status !== 'FREE';

      await tx`
        INSERT INTO software_licenses (
          id, subscription_id, user_id, license_key, verify_key,
          payment_no, is_active
        ) VALUES (
          ${licId}, ${subId}, ${p_user_id}, ${licenseKey}, ${verifyKey},
          ${paymentNo}, ${isActive}
        )
      `;

      // 4. 기기 활성화 (기존 동일 기기 세션은 삭제 후 재생성)
      await tx`
        DELETE FROM license_activations
        WHERE license_id = ${licId}
          AND device_uuid = ${p_device_uuid}
      `;

      await tx`
        INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at)
        VALUES (${licId}, ${p_device_uuid}, ${p_device_name}, now())
      `;

      return {
        success: true,
        code: 'SUCCESS',
        message: '플랜이 활성화되었습니다.',
        license_key: licenseKey,
        verify_key: verifyKey,
        payment_no: paymentNo,
        subscription_id: subId,
        license_id: licId,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/create] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
