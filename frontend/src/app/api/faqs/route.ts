import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabaseClient';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const adminMode = url.searchParams.get('admin') === 'true';

    let query = supabaseAdmin.from('faqs').select('*').order('sort_order', { ascending: true });
    
    // 일반 사용자는 활성화된 FAQ만 조회
    if (!adminMode) {
      query = query.eq('is_active', true);
    }

    const { data: faqs, error } = await query;
    if (error) throw error;

    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('Failed to fetch faqs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authErr } = await verifyAdmin(request);
    if (authErr || !user) return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 403 });

    const body = await request.json();
    const { question, answer, sort_order, is_active } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: '질문과 답변을 모두 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('faqs')
      .insert([
        {
          question,
          answer,
          sort_order: sort_order || 0,
          is_active: is_active ?? true,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to create faq:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
