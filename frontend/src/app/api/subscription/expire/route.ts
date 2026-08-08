import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyUser } from '@/lib/authVerify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_subscription_id, p_user_id } = body;

    if (!p_subscription_id || !p_user_id) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const { user, error: authError } = await verifyUser(request);
    if (authError || !user || user.id !== p_user_id) {
      return NextResponse.json({ success: false, message: '권한이 없습니다.' }, { status: 403 });
    }

    const result = await sql.begin(async (tx) => {
      // 1. 기존 구독 정보 조회 (만료일 확인용)
      const oldSub = await tx`
        SELECT current_period_end
        FROM subscriptions
        WHERE id = ${p_subscription_id}
      `;
      
      let newStartDateStr = new Date().toISOString();
      if (oldSub.length > 0 && oldSub[0].current_period_end) {
        // 기존 구독 만료일 + 1일 (하루 뒤)부터 시작하도록 설정
        const oldEndDate = new Date(oldSub[0].current_period_end);
        oldEndDate.setDate(oldEndDate.getDate() + 1);
        newStartDateStr = oldEndDate.toISOString();
      }

      // 2. 구독 상태를 EXPIRED 및 is_active = false로 변경
      const updatedSub = await tx`
        UPDATE subscriptions
        SET plan_status = 'EXPIRED',
            is_active = false,
            canceled_at = now(),
            updated_at = now()
        WHERE id = ${p_subscription_id}
          AND plan_status != 'EXPIRED'
        RETURNING id
      `;

      if (updatedSub.length === 0) {
        return { success: false, code: 'NOT_FOUND', message: '만료 처리할 구독을 찾을 수 없거나 이미 만료되었습니다.' };
      }

      // 3. 해당 구독의 기기 세션을 무조건 is_active = false (제한사용자)로 강등 업데이트
      // 🚨 @PATCH : 삭제(DELETE)하면 Supabase Realtime에서 DELETE 이벤트가 발생해 강제 로그아웃 되므로 무조건 UPDATE 처리!
      await tx`
        UPDATE license_activations
        SET is_active = false,
            updated_at = now()
        WHERE subscription_id = ${p_subscription_id}
      `;

      // 4. 새로운 READER 구독 발급 (시작일은 만료일+1일, 종료일은 9999-12-31 23:59:59)
      const readerPaymentNo = 'READER-' + Date.now();
      const readerLicenseKey = 'READER-' + Math.random().toString(36).substring(2, 15);
      
      const newReader = await tx`
        INSERT INTO subscriptions (
          user_id, plan_name, plan_status, is_active, max_devices, 
          current_period_start, current_period_end, created_at, updated_at,
          payment_no, license_key
        ) VALUES (
          ${p_user_id}, 'READER', 'ACTIVE', true, 1,
          ${newStartDateStr}, '9999-12-31T23:59:59.000Z', now(), now(),
          ${readerPaymentNo}, ${readerLicenseKey}
        )
        RETURNING id, payment_no
      `;

      const newReaderId = newReader[0].id;
      const newPaymentNo = newReader[0].payment_no;

      return { success: true, code: 'SUCCESS', message: '구독 만료 처리 및 READER 요금제 발급이 완료되었습니다.', new_subscription_id: newReaderId, new_payment_no: newPaymentNo };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/expire] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
