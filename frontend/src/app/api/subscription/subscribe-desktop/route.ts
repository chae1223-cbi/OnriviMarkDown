/**
 * 🎯 @KICK  : subscribe_desktop_plan Supabase RPC를 서버단 API Route로 대체
 * 🚨 @PATCH : 2026-07-22 — supabase.rpc('subscribe_desktop_plan') 클라이언트 직접 호출을 서버단 API Route로 이전
 *             Service Role Key로 RPC를 서버에서 안전하게 호출 (클라이언트 RPC 노출 차단)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_user_id, p_device_uuid, p_device_name } = body;

    if (!p_user_id || !p_device_uuid) {
      return NextResponse.json({ success: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    // Supabase Stored Procedure를 서버단에서 Service Role Key로 안전하게 호출
    const { data, error } = await supabaseAdmin.rpc('subscribe_desktop_plan', {
      p_user_id,
      p_device_uuid,
      p_device_name: p_device_name || 'Desktop App'
    });

    if (error) {
      console.error('[/api/subscription/subscribe-desktop] RPC error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json(data || { success: false, message: '응답 없음' });
  } catch (error: any) {
    console.error('[/api/subscription/subscribe-desktop] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
