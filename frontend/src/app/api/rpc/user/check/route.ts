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
    const { p_email, p_id } = body;

    if (!p_email && !p_id) {
      return NextResponse.json({ exists: false, is_deleted: false }, { status: 400 });
    }

    const cleanEmail = p_email ? p_email.trim().toLowerCase() : null;

    // Primary: Supabase Client users 전용 조회 (service_role로 RLS 우회 조회)
    try {
      let query = supabaseAdmin
        .from('users')
        .select('id, email, nick_name, provider, created_at, updated_at, is_deleted');

      if (p_id) {
        query = query.eq('id', p_id);
      } else if (cleanEmail) {
        query = query.ilike('email', cleanEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (!error) {
        if (data) {
          return NextResponse.json({
            exists: true,
            id: data.id,
            email: data.email,
            nick_name: data.nick_name,
            provider: data.provider,
            created_at: data.created_at,
            updated_at: data.updated_at,
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
