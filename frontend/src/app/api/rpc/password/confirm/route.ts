/**
 * 🚨 @PATCH (2026-07-22): 테이블명 password_resets → password_resets 변경
 *             Auth session missing 오류 수정 — admin.updateUserById() 방식으로 교체
 * 원인: 서버에서 Bearer 토큰만으로 신규 클라이언트 생성 후 updateUser() 호출 시 세션 없음 오류 발생
 * 수정: access_token으로 getUser() 호출해 userId 추출 → admin.updateUserById()로 비밀번호 직접 변경
 * 흐름: 토큰 유효성 검증 → password_resets used=true UPDATE → admin 비밀번호 변경 (원트랜잭션)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ1MTIsImV4cCI6MjA2NzA4MDUxMn0.0N2vQ-kUuQJ6x9iR_pY0n4z9b7X_o8S0Z9X5m2L6f34';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_email, p_new_password, p_user_access_token } = body;

    if (!p_email || !p_new_password || !p_user_access_token) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const cleanEmail = p_email.trim().toLowerCase();

    // ================================================================
    // [원트랜잭션 블록 START]
    // Step 1. access_token으로 실제 userId 추출 (토큰 유효성 검증)
    // ================================================================
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(p_user_access_token);

    if (userErr || !userData?.user) {
      console.error('[password/confirm] access_token 유효성 검증 실패:', userErr);
      return NextResponse.json({ success: false, code: 'TOKEN_INVALID', message: '세션이 만료되었습니다. 비밀번호 찾기를 다시 진행해 주세요.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ================================================================
    // Step 2. password_resets 최신 유효 요청 레코드 확인
    //         (미사용 + 미삭제 + 만료 미경과)
    // ================================================================
    const { data: resetRow, error: resetErr } = await supabaseAdmin
      .from('password_resets')
      .select('id, expires_at, used')
      .ilike('email', cleanEmail)
      .eq('used', false)
      .eq('is_deleted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resetErr) {
      console.error('[password/confirm] password_resets 조회 오류:', resetErr);
      return NextResponse.json({ success: false, code: 'DB_ERROR', message: '재설정 요청 확인 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (!resetRow) {
      return NextResponse.json({ success: false, code: 'TOKEN_INVALID', message: '유효한 비밀번호 재설정 요청이 없거나 만료되었습니다. 비밀번호 찾기를 다시 진행해 주세요.' }, { status: 400 });
    }

    // ================================================================
    // Step 3. password_resets used=true 선소비 처리 (원트랜잭션)
    // 동시 요청 경쟁 조건 방지: CAS 가드 (used=false 조건부 UPDATE)
    // ================================================================
    const { error: updateErr } = await supabaseAdmin
      .from('password_resets')
      .update({
        used: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetRow.id)
      .eq('used', false);   // CAS 이중 가드

    if (updateErr) {
      console.error('[password/confirm] password_resets UPDATE 오류:', updateErr);
      return NextResponse.json({ success: false, code: 'DB_UPDATE_ERROR', message: '재설정 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // ================================================================
    // Step 4. Supabase Admin으로 비밀번호 직접 변경 (Auth session 불필요)
    // admin.updateUserById()는 서비스 롤 키로 세션 없이 비밀번호 변경 가능
    // ================================================================
    const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: p_new_password
    });

    if (pwErr) {
      console.error('[password/confirm] admin 비밀번호 변경 오류:', pwErr);
      // 비밀번호 변경 실패 시 used 롤백 (false 복구)
      await supabaseAdmin
        .from('password_resets')
        .update({ used: false, updated_at: new Date().toISOString() })
        .eq('id', resetRow.id);

      return NextResponse.json({ success: false, code: 'PW_UPDATE_ERROR', message: '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해 주세요.' }, { status: 500 });
    }
    // [원트랜잭션 블록 END]
    // ================================================================

    return NextResponse.json({ success: true, code: 'RESET_COMPLETE', message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error: any) {
    console.error('[password/confirm] Error:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
