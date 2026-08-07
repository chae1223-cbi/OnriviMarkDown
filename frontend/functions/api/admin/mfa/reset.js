import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig, checkAdminAuth } from '../_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Secure the route
    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
       return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const { email } = await request.json();

    if (!email) {
      return jsonResponse({ error: '이메일이 제공되지 않았습니다.' }, 400);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    // 1. 이메일로 사용자 검색
    const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
    if (!usersRes.ok) throw new Error(`Failed to list users: ${await usersRes.text()}`);
    const usersData = await usersRes.json();

    const targetUser = usersData.users?.find(u => u.email === email);

    if (!targetUser) {
      return jsonResponse({ error: '사용자를 찾을 수 없습니다.' }, 404);
    }

    // 2. 사용자의 MFA Factors 목록 조회
    const factorsRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUser.id}/factors`, { headers });
    if (!factorsRes.ok) throw new Error(`Failed to list factors: ${await factorsRes.text()}`);
    const factorsData = await factorsRes.json();

    if (!factorsData || factorsData.length === 0) {
      return jsonResponse({ message: '등록된 인증 기기가 없습니다.' }, 200);
    }

    // 3. 등록된 모든 Factor 삭제
    let deletedCount = 0;
    for (const factor of factorsData) {
      const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUser.id}/factors/${factor.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (deleteRes.ok) {
        deletedCount++;
      } else {
        console.error('Delete Factor Error:', await deleteRes.text());
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
