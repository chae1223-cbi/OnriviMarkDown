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
      p_today_str,
      p_device_uuid,
      p_device_name,
    } = body;

    if (!p_user_id || !p_plan_name || !p_device_uuid) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const result = await sql.begin(async (tx) => {
      // 1. [재가입 방지 검증]: 무료 요금제 신청 시 DB 전체 이력 중 어떤 구독(만료/취소 포함)이라도 존재하면 무료 재가입 전면 차단
      if (p_plan_name === 'APPRENTICE' || p_plan_name === 'FREE') {
        const pastSubs = await tx`
          SELECT id FROM subscriptions WHERE user_id = ${p_user_id} LIMIT 1
        `;
        if (pastSubs && pastSubs.length > 0) {
          throw new Error("이미 구독 신청 및 이용 이력이 존재하는 계정이므로 무료 체험 재가입이 불가능합니다. 유료 요금제를 선택해 주세요.");
        }
      }

      // 2. [1인 1구독 통제]: 유저의 기존 모든 구독(상태 상관없이)을 만료(EXPIRED) 및 비활성화(is_active = false) 처리하여 유저는 무조건 1개의 활성 구독만 유지
      await tx`
        UPDATE subscriptions
        SET plan_status = 'EXPIRED',
            is_active = false,
            canceled_at = COALESCE(canceled_at, now()),
            updated_at = now()
        WHERE user_id = ${p_user_id}
      `;

      // 2. 통합 구독 생성 (subscriptions)
      const subId = crypto.randomUUID();
      let periodEndTs: string;
      if (p_period_end && p_period_end.includes('-')) {
        // ISO string (e.g., "2026-08-21T17:58:58.000Z")
        periodEndTs = new Date(p_period_end).toISOString();
      } else if (p_period_end && p_period_end.length >= 8) {
        // YYYYMMDD string
        periodEndTs = `${p_period_end.substring(0, 4)}-${p_period_end.substring(4, 6)}-${p_period_end.substring(6, 8)}T23:59:59Z`;
      } else {
        // Fallback 30 days
        periodEndTs = new Date(Date.now() + 30 * 86400000).toISOString();
      }
      const licenseKey = crypto.randomBytes(8).toString('hex').toUpperCase();
      const verifyKey = crypto.randomBytes(8).toString('hex').toUpperCase();
      const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const isActive = p_plan_status === 'ACTIVE' || p_plan_status === 'FREE';
      let billingCycle = 'MONTHLY';
      if (p_billing_interval) {
        const upperInterval = p_billing_interval.toUpperCase();
        if (upperInterval === 'YEAR' || upperInterval === 'YEARLY') billingCycle = 'YEARLY';
        else if (upperInterval === 'MONTH' || upperInterval === 'MONTHLY') billingCycle = 'MONTHLY';
        else billingCycle = upperInterval;
      }

      await tx`
        INSERT INTO subscriptions (
          id, created_by, updated_by, user_id, plan_name, plan_status, billing_cycle,
          license_key, verify_key, payment_no, max_devices,
          current_period_start, current_period_end, is_active, created_at, updated_at
        ) VALUES (
          ${subId}, ${p_user_id}, ${p_user_id}, ${p_user_id}, ${p_plan_name}, ${p_plan_status}, ${billingCycle},
          ${licenseKey}, ${verifyKey}, ${paymentNo}, ${p_max_devices},
          now(), ${periodEndTs}::timestamptz, ${isActive}, now(), now()
        )
      `;

      // 3. 기기 활성화 (기존 동일 기기 세션은 삭제 후 재생성)
      await tx`
        DELETE FROM license_activations
        WHERE subscription_id = ${subId}
          AND device_uuid = ${p_device_uuid}
      `;

      await tx`
        INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at)
        VALUES (${subId}, ${p_device_uuid}, ${p_device_name}, now())
      `;

      return {
        success: true,
        code: 'SUCCESS',
        message: '플랜이 활성화되었습니다.',
        license_key: licenseKey,
        verify_key: verifyKey,
        payment_no: paymentNo,
        subscription_id: subId,
        license_id: subId,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/create] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
