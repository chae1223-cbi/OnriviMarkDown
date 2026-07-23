/**
 * 🚨 @PATCH (2026-07-22): users 전용 이메일 회원 검증 (기존 users 테이블 폴백 제거)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sql } from '@/lib/db';
import { checkUserByEmailQuery } from '@/lib/db/queries/userQueries';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDQ1MTIsImV4cCI6MjA2NzA4MDUxMn0.0N2vQ-kUuQJ6x9iR_pY0n4z9b7X_o8S0Z9X5m2L6f34';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_email } = body;

    if (!p_email) {
      return NextResponse.json({ exists: false, is_deleted: false }, { status: 400 });
    }

    const cleanEmail = p_email.trim().toLowerCase();

    // Primary: Supabase Client users 전용 조회
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, is_deleted')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (!error) {
        if (data) {
          return NextResponse.json({
            exists: true,
            id: data.id,
            is_deleted: data.is_deleted
          });
        } else {
          return NextResponse.json({ exists: false, is_deleted: false });
        }
      }
    } catch (sbErr) {
      console.warn('[/api/rpc/user/check] Supabase check exception, fallback to sql:', sbErr);
    }

    // Fallback: Direct Postgres SQL (users 전용)
    const result = await checkUserByEmailQuery(sql, cleanEmail);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/rpc/user/check] Error:', error);
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}
