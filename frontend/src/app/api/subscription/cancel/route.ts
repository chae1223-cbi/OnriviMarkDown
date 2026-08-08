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
      // 1. 구독 상태를 CANCELED 및 is_active = false로 변경
      const updatedSub = await tx`
        UPDATE subscriptions
        SET plan_status = 'CANCELED',
            is_active = false,
            canceled_at = now(),
            updated_at = now()
        WHERE id = ${p_subscription_id}
          AND user_id = ${p_user_id}
          AND is_active = true
        RETURNING id
      `;

      if (updatedSub.length === 0) {
        return { success: false, code: 'NOT_FOUND', message: '해지할 구독을 찾을 수 없습니다.' };
      }

      return { success: true, code: 'SUCCESS', message: '구독이 해지되었습니다.' };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/subscription/cancel] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
