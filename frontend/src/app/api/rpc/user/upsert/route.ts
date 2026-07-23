/**
 * 🚨 @PATCH (2026-07-22): 회원가입/계정복구 시 users nick_name(활동명) 칼럼 연동 및 Supabase Client + Postgres SQL 2중 트랜잭션 수용
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sql } from '@/lib/db';
import { upsertUserQuery } from '@/lib/db/queries/userQueries';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ1MTIsImV4cCI6MjA2NzA4MDUxMn0.0N2vQ-kUuQJ6x9iR_pY0n4z9b7X_o8S0Z9X5m2L6f34';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_id, p_email, p_provider, p_nick_name, p_password } = body;

    if (!p_id || !p_email) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }, { status: 400 });
    }

    const cleanEmail = p_email.trim().toLowerCase();
    const upperProvider = (p_provider || 'EMAIL').toUpperCase();
    const nickName = p_nick_name ? p_nick_name.trim() : null;

    // 1. 비밀번호가 전달된 경우 Supabase Auth(auth.users) 회원 비밀번호 및 user_metadata 업데이트
    if (p_password) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(p_id, {
        password: p_password,
        user_metadata: { name: nickName }
      });
      if (authErr) {
        console.warn('[/api/rpc/user/upsert] Supabase auth admin password update error:', authErr);
      }
    }

    // 2. Primary: Supabase Admin Client -> users 복구 및 정보 전면 업데이트
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: p_id,
          created_by: p_id,
          created_at: new Date().toISOString(),
          updated_by: p_id,
          updated_at: new Date().toISOString(),
          email: cleanEmail,
          provider: upperProvider,
          is_deleted: false,
          deleted_at: null,
          nick_name: nickName
        }, { onConflict: 'id' });

      if (error) {
        console.warn('[/api/rpc/user/upsert] Supabase upsert error, attempting sql fallback:', error);
        await upsertUserQuery(sql, p_id, cleanEmail, upperProvider, nickName);
      }
    } catch (sbErr) {
      console.warn('[/api/rpc/user/upsert] Supabase exception, attempting sql fallback:', sbErr);
      await upsertUserQuery(sql, p_id, cleanEmail, upperProvider, nickName);
    }

    return NextResponse.json({ success: true, code: 'SUCCESS', message: '사용자 및 비밀번호 동기화/복구 완료' });
  } catch (error: any) {
    console.error('[/api/rpc/user/upsert] Error:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
