import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, promotion_code } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
    }
    if (!promotion_code) {
      return NextResponse.json({ success: false, message: '유효하지 않은 프로모션입니다.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('promotion_subscribers')
      .insert([{ email, promotion_code }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: '이미 사전 등록된 이메일입니다!' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: '사전 등록이 완료되었습니다.' });
  } catch (error: any) {
    console.error('[/api/beta/register] 오류:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
