import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const now = new Date().toISOString();

    // is_active = true이고 기간이 유효한 프로모션 1개 조회
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .select('code, title, description, end_date')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ promotion: data || null });
  } catch (error: any) {
    return NextResponse.json({ promotion: null, message: error.message }, { status: 500 });
  }
}
