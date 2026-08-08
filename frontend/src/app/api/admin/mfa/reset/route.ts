import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '이메일이 제공되지 않았습니다.' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: '서버 환경 변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    // 관리자용 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. 이메일로 사용자 검색
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 사용자의 MFA Factors 목록 조회
    const { data: factorsData, error: factorsError } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId: targetUser.id
    });

    if (factorsError) {
      throw factorsError;
    }

    if (!factorsData || factorsData.factors.length === 0) {
      return NextResponse.json({ message: '등록된 인증 기기가 없습니다.' }, { status: 200 });
    }

    // 3. 등록된 모든 Factor 삭제
    let deletedCount = 0;
    for (const factor of factorsData.factors) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
        userId: targetUser.id,
        id: factor.id
      });
      
      if (!deleteError) {
        deletedCount++;
      } else {
        console.error('Delete Factor Error:', deleteError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${deletedCount}개의 인증 기기가 성공적으로 초기화되었습니다.` 
    });

  } catch (error: any) {
    console.error('OTP Reset Error:', error);
    return NextResponse.json({ error: '초기화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
