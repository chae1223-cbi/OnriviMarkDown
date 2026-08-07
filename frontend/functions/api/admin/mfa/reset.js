import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin, checkAdminAuth } from '../../_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    // Secure the route
    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
       return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const { email } = await request.json();

    if (!email) {
      return jsonResponse({ error: '이메일이 제공되지 않았습니다.' }, 400);
    }

    // 1. 이메일로 사용자 검색
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return jsonResponse({ error: '사용자를 찾을 수 없습니다.' }, 404);
    }

    // 2. 사용자의 MFA Factors 목록 조회
    const { data: factorsData, error: factorsError } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId: targetUser.id
    });

    if (factorsError) {
      throw factorsError;
    }

    if (!factorsData || factorsData.factors.length === 0) {
      return jsonResponse({ message: '등록된 인증 기기가 없습니다.' }, 200);
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

    return jsonResponse({ 
      success: true, 
      message: `${deletedCount}개의 인증 기기가 성공적으로 초기화되었습니다.` 
    });

  } catch (error) {
    console.error('OTP Reset Error:', error);
    return jsonResponse({ error: '초기화 중 오류가 발생했습니다.' }, 500);
  }
}
