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
      // 1. 구독 상태를 EXPIRED 및 is_active = false로 변경
      const updatedSub = await tx`
        UPDATE subscriptions
        SET plan_status = 'EXPIRED',
            is_active = false,
            canceled_at = now(),
            updated_at = now()
        WHERE id = ${p_subscription_id}
          AND is_active = true
        RETURNING id
      `;

      if (updatedSub.length === 0) {
        return { success: false, code: 'NOT_FOUND', message: '만료 처리할 구독을 찾을 수 없거나 이미 만료되었습니다.' };
      }

      // 2. 해당 구독의 활성 기기 세션 모두 삭제
      await tx`
        DELETE FROM license_activations
        WHERE subscription_id = ${p_subscription_id}
      `;

      return { success: true, code: 'SUCCESS', message: '구독 만료 처리가 완료되었습니다.' };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/expire] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
