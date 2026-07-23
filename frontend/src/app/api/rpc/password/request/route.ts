/**
 * 🚨 @PATCH (2026-07-22): 토큰 만료 30분 변경 + 테이블명 password_resets → password_resets 변경
 *             비밀번호 재설정 요청 - password_resets 원트랜잭션 저장 및 Supabase 메일 발송
 * 흐름: users 회원 존재 확인 → password_resets INSERT → Supabase resetPasswordForEmail 발송
 * 원트랜잭션: DB INSERT와 메일 발송을 하나의 try 블록으로 묶어 처리, INSERT 실패 시 메일 미발송
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ1MTIsImV4cCI6MjA2NzA4MDUxMn0.0N2vQ-kUuQJ6x9iR_pY0n4z9b7X_o8S0Z9X5m2L6f34';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_email, p_redirect_url } = body;

    if (!p_email) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '이메일을 입력해 주세요.' }, { status: 400 });
    }

    const cleanEmail = p_email.trim().toLowerCase();
    const redirectUrl = p_redirect_url || `${supabaseUrl}/reset-password`;

    // ================================================================
    // [원트랜잭션 블록 START]
    // Step 1. users 회원 존재 확인
    // ================================================================
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, is_deleted')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (userErr) {
      console.error('[password/request] users 조회 오류:', userErr);
      return NextResponse.json({ success: false, code: 'DB_ERROR', message: '회원 정보 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 보안상 사용자 존재 여부와 무관하게 동일한 성공 응답 (이메일 열거 공격 방지)
    if (!userRow || userRow.is_deleted) {
      return NextResponse.json({ success: true, code: 'SENT', message: '비밀번호 재설정 이메일이 발송되었습니다.' });
    }

    // ================================================================
    // Step 2. password_resets 토큰 레코드 INSERT (원트랜잭션)
    // 만료 시간: 30분 후
    // ================================================================
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30분

    const { error: insertErr } = await supabaseAdmin
      .from('password_resets')
      .insert({
        created_by: userRow.id,
        updated_by: userRow.id,
        email: cleanEmail,
        token: crypto.randomUUID(),
        expires_at: expiresAt,
        used: false,
        is_deleted: false
      });

    if (insertErr) {
      console.error('[password/request] password_resets INSERT 오류:', insertErr);
      return NextResponse.json({ success: false, code: 'DB_INSERT_ERROR', message: '재설정 요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // ================================================================
    // Step 3. Supabase Auth 비밀번호 재설정 메일 발송
    // INSERT 성공 후에만 메일 발송 (원트랜잭션 보장)
    // ================================================================
    const { error: mailErr } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });

    if (mailErr) {
      console.error('[password/request] Supabase 메일 발송 오류:', mailErr);
      // 메일 발송 실패 시 방금 INSERT한 레코드를 소프트딜리트 처리 (롤백 효과)
      await supabaseAdmin
        .from('password_resets')
        .update({ is_deleted: true, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('email', cleanEmail)
        .eq('used', false)
        .eq('is_deleted', false);

      return NextResponse.json({ success: false, code: 'MAIL_ERROR', message: '메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
    }
    // [원트랜잭션 블록 END]
    // ================================================================

    return NextResponse.json({ success: true, code: 'SENT', message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (error: any) {
    console.error('[password/request] Error:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
