import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 로컬 Next 개발 서버에서 운영 Pages Function과 동일한 BLOG_CATEGORY 목록을 제공한다.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: group, error: groupError } = await supabaseAdmin
      .from('common_code_groups')
      .select('is_use')
      .eq('group_code', 'BLOG_CATEGORY')
      .maybeSingle();
    if (groupError) throw groupError;

    const { data: codes, error: codesError } = await supabaseAdmin
      .from('common_codes')
      .select('code_value, code_name, is_use')
      .eq('group_code', 'BLOG_CATEGORY')
      .order('sort_order', { ascending: true })
      .order('code_value', { ascending: true });
    if (codesError) throw codesError;

    return NextResponse.json({
      categories: (codes || []).map((code: { code_value: string; code_name: string; is_use: boolean }) => ({
        value: code.code_value,
        name: code.code_name,
        active: code.is_use === true && group?.is_use === true,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[blog categories] local list failed', error);
    return NextResponse.json({ error: '블로그 분류 조회 실패' }, { status: 500 });
  }
}
