import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig, insertAuditLog } from './_shared.js';

export const onRequestOptions = handleOptions;

const ROOT_ADMIN_EMAIL = 'chaetang1223@gmail.com';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const res = await fetch(`${supabaseUrl}/rest/v1/admins?select=*&order=created_at.desc`, {
      method: 'GET',
      headers
    });
    if (!res.ok) throw new Error(`Failed to fetch admins: ${await res.text()}`);
    const admins = await res.json();

    return jsonResponse({ success: true, data: admins });
  } catch (error) {
    console.error('[Admin API] Error fetching admins:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { supabaseUrl, headers } = getSupabaseConfig(env);
    
    const body = await request.json();
    const { email, role, adminId } = body;

    if (!email || !role) {
      return jsonResponse({ success: false, error: '이메일과 권한(Role)은 필수입니다.' }, 400);
    }

    if (adminId) {
      const reqRes = await fetch(`${supabaseUrl}/rest/v1/admins?user_id=eq.${adminId}&select=admin_role`, { headers });
      const reqRows = await reqRes.json();
      const requester = reqRows && reqRows.length > 0 ? reqRows[0] : null;
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    // List users
    const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
    const usersData = await usersRes.json();
    const authUser = usersData.users?.find(u => u.email === email);
    let finalUserId = authUser ? authUser.id : null;

    if (!finalUserId) {
      // Create user
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, email_confirm: true })
      });
      if (!createRes.ok) throw new Error('Failed to create auth user: ' + await createRes.text());
      const newUser = await createRes.json();
      finalUserId = newUser.id;
      
      // Insert into users
      await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id: finalUserId,
          email,
          nick_name: '관리자',
          status: 'ACTIVE'
        })
      });
    }

    // Check existing admin
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(email)}&select=id`, { headers });
    const checkRows = await checkRes.json();
    if (checkRows && checkRows.length > 0) {
      return jsonResponse({ success: false, error: '이미 등록된 관리자입니다.' }, 400);
    }

    // Insert admin
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/admins`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        user_id: finalUserId,
        email: email,
        admin_role: role
      })
    });
    if (!insertRes.ok) throw new Error(`Failed to insert admin: ${await insertRes.text()}`);

    await insertAuditLog(env, finalUserId, adminId, 'ADMIN_INVITE', 'Invited as ' + role);

    return jsonResponse({ success: true, message: '관리자가 성공적으로 등록되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error inviting admin:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const body = await request.json();
    const { adminTargetId, targetEmail, newRole, adminId } = body;

    if (!adminTargetId || !newRole || !targetEmail) {
      return jsonResponse({ success: false, error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return jsonResponse({ success: false, error: '최상위 관리자의 권한은 변경할 수 없습니다.' }, 403);
    }

    if (adminId) {
      const reqRes = await fetch(`${supabaseUrl}/rest/v1/admins?user_id=eq.${adminId}&select=admin_role`, { headers });
      const reqRows = await reqRes.json();
      const requester = reqRows && reqRows.length > 0 ? reqRows[0] : null;
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/admins?id=eq.${adminTargetId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ admin_role: newRole })
    });
    if (!updateRes.ok) throw new Error(`Failed to update admin: ${await updateRes.text()}`);

    await insertAuditLog(env, null, adminId, 'ADMIN_ROLE_CHANGE', 'Changed role of ' + targetEmail + ' to ' + newRole);

    return jsonResponse({ success: true, message: '관리자 권한이 성공적으로 변경되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error updating admin role:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const url = new URL(request.url);
    const adminTargetId = url.searchParams.get('adminTargetId');
    const targetEmail = url.searchParams.get('targetEmail');
    const adminId = url.searchParams.get('adminId');

    if (!adminTargetId || !targetEmail) {
      return jsonResponse({ success: false, error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    if (targetEmail === ROOT_ADMIN_EMAIL) {
      return jsonResponse({ success: false, error: '최상위 관리자는 비활성화(회수)할 수 없습니다.' }, 403);
    }

    if (adminId) {
      const reqRes = await fetch(`${supabaseUrl}/rest/v1/admins?user_id=eq.${adminId}&select=admin_role`, { headers });
      const reqRows = await reqRes.json();
      const requester = reqRows && reqRows.length > 0 ? reqRows[0] : null;
      if (!requester || requester.admin_role !== 'SUPER') {
        return jsonResponse({ success: false, error: 'SUPER 권한이 필요합니다.' }, 403);
      }
    }

    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/admins?id=eq.${adminTargetId}`, {
      method: 'DELETE',
      headers
    });
    if (!deleteRes.ok) throw new Error(`Failed to delete admin: ${await deleteRes.text()}`);

    const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
    const usersData = await usersRes.json();
    const targetAuthUser = usersData.users?.find(u => u.email === targetEmail);

    if (targetAuthUser) {
      const factorsRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetAuthUser.id}/factors`, { headers });
      if (factorsRes.ok) {
        const factorsData = await factorsRes.json();
        const totpFactors = factorsData?.filter(f => f.factor_type === 'totp') ?? [];
        for (const factor of totpFactors) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetAuthUser.id}/factors/${factor.id}`, {
            method: 'DELETE',
            headers
          });
        }
      }
    }

    await insertAuditLog(env, targetAuthUser?.id || null, adminId, 'ADMIN_REVOKE', 'Revoked admin access and deleted MFA for ' + targetEmail);

    return jsonResponse({ success: true, message: '관리자 권한이 즉시 회수되었으며, OTP 재등록이 초기화되었습니다.' });

  } catch (error) {
    console.error('[Admin API] Error revoking admin:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
