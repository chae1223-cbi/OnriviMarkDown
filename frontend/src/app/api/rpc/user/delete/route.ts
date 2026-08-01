// 🎯 @KICK  : 회원 탈퇴 처리 API (DB Stored Procedure 제거 및 imsi_ 이관 테이블 원트랜잭션 적용)
// 🚨 @PATCH : 2026-08-01 — 회원 탈퇴 시 user_audit_logs에 내역(USER_WITHDRAW) 저장 로직 추가

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { p_user_id } = await request.json();

    if (!p_user_id) {
      return NextResponse.json({ success: false, message: 'p_user_id가 필요합니다.' }, { status: 400 });
    }

    // postgres.js 원트랜잭션 실행
    await sql.begin(async (transactionSql) => {
      // 1. 해당 유저의 모든 기기 접속 세션 삭제 (license_activations)
      await transactionSql`
        DELETE FROM license_activations
        WHERE subscription_id IN (
          SELECT id FROM subscriptions WHERE user_id = ${p_user_id}
        )
      `;

      // 2. 해당 유저의 구독 및 라이선스 비활성화 (subscriptions)
      await transactionSql`
        UPDATE subscriptions
        SET is_active = false,
            plan_status = 'CANCELED',
            updated_at = NOW()
        WHERE user_id = ${p_user_id}
      `;

      // 3. 이관 유저 테이블(users) 소프트 딜리트 (is_deleted = true, deleted_at = NOW())
      await transactionSql`
        UPDATE users
        SET is_deleted = true,
            deleted_at = NOW(),
            updated_at = NOW()
        WHERE id = ${p_user_id}
      `;

      // 4. 탈퇴 로그 기록 (user_audit_logs)
      await transactionSql`
        INSERT INTO user_audit_logs (target_user_id, admin_id, action_type, reason)
        VALUES (${p_user_id}, null, 'USER_WITHDRAW', '사용자 본인 자진 탈퇴')
      `;
    });

    return NextResponse.json({
      success: true,
      code: 'SUCCESS',
      message: '회원 탈퇴가 성공적으로 처리되었습니다.'
    });
  } catch (error: any) {
    console.error('[/api/rpc/user/delete] 회원 탈퇴 처리 에러:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
