import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_subscription_id } = body;

    if (!p_subscription_id) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const result = await sql.begin(async (tx) => {
      const v_now = new Date().toISOString().slice(0, 10).replace(/-/g, '');

      // 1. 구독 상태를 EXPIRED로 변경
      const updatedSub = await tx`
        UPDATE subscriptions
        SET plan_status = 'EXPIRED',
            is_expired = 'Y',
            plan_end_date = ${v_now}
        WHERE id = ${p_subscription_id}
          AND is_expired = 'N'
        RETURNING id
      `;

      if (updatedSub.length === 0) {
        return { success: false, code: 'NOT_FOUND', message: '만료 처리할 구독을 찾을 수 없거나 이미 만료되었습니다.' };
      }

      // 2. 해당 구독에 연결된 라이선스 비활성화
      await tx`
        UPDATE software_licenses
        SET is_active = false
        WHERE subscription_id = ${p_subscription_id}
      `;

      // 3. 해당 라이선스의 활성 기기 세션 모두 삭제
      await tx`
        DELETE FROM license_activations
        WHERE license_id IN (
          SELECT id FROM software_licenses WHERE subscription_id = ${p_subscription_id}
        )
      `;

      return { success: true, code: 'SUCCESS', message: '구독 만료 처리가 완료되었습니다.' };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/expire] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
