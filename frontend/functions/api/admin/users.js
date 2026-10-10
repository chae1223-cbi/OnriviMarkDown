// 🚨 @PATCH : 2026-10-08 — 세션 해제(kill_session) UUID 정규표현식 5그룹(8-4-4-4-12) 누락 수정
// 🚨 @PATCH : 2026-09-28 — 사용자별 요금제 변경 화면에 현재 주기와 관리자 수동 무료/유료 구분을 제공
import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig, executeDeleteActivations, insertAuditLog } from './_shared.js';
import { withBlogTransaction } from '../blog/_db.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type') || 'general'; // 'general' or 'admin'
    const filterStatus = url.searchParams.get('status') || 'ALL';
    const filterPlan = url.searchParams.get('plan') || 'ALL';
    const requestedUserId = url.searchParams.get('userId');

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    if (type === 'general') {
      const usersRes = await fetch(`${supabaseUrl}/rest/v1/users?select=*&order=created_at.desc`, { headers });
      if (!usersRes.ok) throw new Error(`Failed to fetch users: ${await usersRes.text()}`);
      const users = await usersRes.json();
      
      const userIds = users.map(u => u.id);
      let subsMap = {};
      let subIdToUserIdMap = {};
      let subIds = [];
      
      if (userIds.length > 0) {
        const subsRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=in.(${userIds.join(',')})&plan_status=eq.ACTIVE&select=*`, { headers });
        if (subsRes.ok) {
          const subs = await subsRes.json();
          subs.forEach(s => {
            subsMap[s.user_id] = s;
            subIdToUserIdMap[s.id] = s.user_id;
            subIds.push(s.id);
          });
        }
      }

      const codesRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?group_code=eq.PLAN_NAME&is_use=eq.true&select=code_value,code_name`, { headers });
      const planCodeMap = {};
      if (codesRes.ok) {
        const codesData = await codesRes.json();
        codesData.forEach(c => {
          planCodeMap[c.code_value] = c.code_name;
        });
      }

      const authUsersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
      const authMap = {};
      if (authUsersRes.ok) {
        const authUsers = await authUsersRes.json();
        authUsers.users?.forEach(au => {
          authMap[au.id] = au;
        });
      }

      let activationsMap = {};
      if (userIds.length > 0) {
        const actsList = [];
        
        const actsByUserRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?created_by=in.(${userIds.join(',')})&is_active=eq.true&select=id,created_by,subscription_id,device_name,activated_at,is_active`, { headers });
        if (actsByUserRes.ok) {
          actsList.push(...(await actsByUserRes.json()));
        }

        if (subIds.length > 0) {
          const actsBySubRes = await fetch(`${supabaseUrl}/rest/v1/license_activations?subscription_id=in.(${subIds.join(',')})&is_active=eq.true&select=id,created_by,subscription_id,device_name,activated_at,is_active`, { headers });
          if (actsBySubRes.ok) {
            actsList.push(...(await actsBySubRes.json()));
          }
        }

        const seenActs = new Set();
        actsList.forEach(a => {
          if (seenActs.has(a.id)) return;
          seenActs.add(a.id);
          
          const userId = a.created_by || subIdToUserIdMap[a.subscription_id];
          if (userId) {
            if (!activationsMap[userId]) {
              activationsMap[userId] = [];
            }
            activationsMap[userId].push(a);
          }
        });
      }

      let formattedData = users.map(u => {
        const sub = subsMap[u.id];
        const authUser = authMap[u.id];
        const rawPlan = sub ? sub.plan_name : 'READER';
        const displayPlan = planCodeMap[rawPlan] || rawPlan;

        let currentStatus = 'ACTIVE';
        if (authUser?.banned_until) {
          currentStatus = 'SUSPENDED';
        } else if (u.is_deleted) {
          currentStatus = 'DELETED';
        } else if (sub && sub.plan_status) {
          currentStatus = sub.plan_status;
        }

        return {
          id: u.id,
          email: u.email,
          nick_name: u.nick_name || '-',
          plan: displayPlan,
          plan_code: rawPlan,
          billing_cycle: sub?.billing_cycle || 'NONE',
          admin_grant_type: String(sub?.payment_no || '').startsWith('ADMIN-FREE-') ? 'FREE' :
            String(sub?.payment_no || '').startsWith('ADMIN-PAID-') ? 'PAID' : null,
          status: currentStatus,
          date: u.created_at ? new Date(u.created_at).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }) : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-',
          start_date: sub?.current_period_start ? new Date(sub.current_period_start).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }) : '-',
          end_date: sub?.current_period_end ? (sub.current_period_end.startsWith('9999') ? '무제한' : new Date(sub.current_period_end).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })) : '-',
          devices: activationsMap[u.id] || []
        };
      });

      if (requestedUserId) formattedData = formattedData.filter(u => u.id === requestedUserId);

      if (filterStatus !== 'ALL') {
        formattedData = formattedData.filter(u => u.status === filterStatus);
      }
      if (filterPlan !== 'ALL') {
        formattedData = formattedData.filter(u => {
          if (filterPlan === 'READER') return u.plan_code === 'READER';
          if (filterPlan === 'PRO') return u.plan_code !== 'READER';
          return u.plan_code === filterPlan;
        });
      }

      const total = formattedData.length;
      const paginatedData = formattedData.slice((page - 1) * limit, page * limit);

      return jsonResponse({ success: true, data: paginatedData, total, page, limit });
    } else {
      const adminsRes = await fetch(`${supabaseUrl}/rest/v1/admins?select=*&order=created_at.desc`, { headers });
      if (!adminsRes.ok) throw new Error(`Failed to fetch admins: ${await adminsRes.text()}`);
      const admins = await adminsRes.json();

      const authUsersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { headers });
      const authMap = {};
      if (authUsersRes.ok) {
        const authUsers = await authUsersRes.json();
        authUsers.users?.forEach(au => {
          authMap[au.id] = au;
        });
      }

      let formattedData = admins.map(a => {
        const authUser = authMap[a.user_id]; // 🚨 @PATCH 2026-08-07: a.id(admins PK) → a.user_id(auth FK) 수정
        return {
          id: a.id,
          email: a.email,
          nick_name: '-', 
          plan: a.role === 'SUPER_ADMIN' ? 'Super Admin' : (a.role || 'Support Admin'),
          status: a.is_active === false ? 'SUSPENDED' : 'ACTIVE',
          date: a.created_at ? new Date(a.created_at).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }) : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-',
          end_date: '-'
        };
      });

      if (filterStatus !== 'ALL') {
        formattedData = formattedData.filter(a => a.status === filterStatus);
      }

      const total = formattedData.length;
      const paginatedData = formattedData.slice((page - 1) * limit, page * limit);

      return jsonResponse({ success: true, data: paginatedData, total, page, limit });
    }
  } catch (error) {
    console.error('[Admin API] Error fetching users:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { action, userId, reason } = body;
    const adminId = request.headers.get('x-verified-admin-id');

    if (!userId || !action) {
      return jsonResponse({ success: false, error: 'Missing parameters' }, 400);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    if (action === 'suspend') {
      const banRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ban_duration: '87600h' })
      });
      if (!banRes.ok) throw new Error('Failed to ban user in Auth: ' + await banRes.text());
      
      const subsRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=id`, { headers });
      let subIds = [];
      if (subsRes.ok) {
        const subs = await subsRes.json();
        subIds = subs.map(s => s.id);
      }
      await executeDeleteActivations(env, subIds, [userId], null);
      await insertAuditLog(env, userId, adminId, 'SUSPEND', reason);
      
      return jsonResponse({ success: true, message: `User ${userId} suspended successfully.` });
    }

    if (action === 'kill_single_session') {
      const deviceId = body.deviceId;
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(userId) || !uuid.test(deviceId || '')) return jsonResponse({ success: false, error: 'Invalid user or device ID' }, 400);
      const result = await withBlogTransaction(env, async db => {
        const found = await db.query(`SELECT a.id FROM public.license_activations a JOIN public.subscriptions s ON s.id = a.subscription_id
          WHERE a.id = $1 AND s.user_id = $2 FOR UPDATE OF a`, [deviceId, userId]);
        if (!found.rows.length) return { found: false, changed: 0 };
        const changed = await db.query(`UPDATE public.license_activations SET is_active = false, deactivated_at = now(), updated_at = now(), updated_by = $1
          WHERE id = $2 AND is_active = true RETURNING id`, [adminId, deviceId]);
        if (changed.rows.length) await db.query(`INSERT INTO public.user_audit_logs (target_user_id, admin_id, action_type, reason)
          VALUES ($1, $2, 'KILL_SESSION', $3)`, [userId, adminId, `device=${deviceId}; 사용자 상세에서 기기 해제`]);
        return { found: true, changed: changed.rows.length };
      });
      return result.found ? jsonResponse({ success: true, changed: result.changed }) : jsonResponse({ success: false, error: 'Device not found for user' }, 404);
    }

    if (action === 'kill_session') {
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(userId)) return jsonResponse({ success: false, error: 'Invalid user ID' }, 400);
      const result = await withBlogTransaction(env, async db => {
        const found = await db.query('SELECT id FROM public.users WHERE id = $1 FOR UPDATE', [userId]);
        if (!found.rows.length) return { found: false, changed: 0 };
        const changed = await db.query(`UPDATE public.license_activations a SET is_active = false, deactivated_at = now(), updated_at = now(), updated_by = $1
          FROM public.subscriptions s WHERE a.subscription_id = s.id AND s.user_id = $2 AND a.is_active = true RETURNING a.id`, [adminId, userId]);
        if (changed.rows.length) await db.query(`INSERT INTO public.user_audit_logs (target_user_id, admin_id, action_type, reason)
          VALUES ($1, $2, 'KILL_SESSION', $3)`, [userId, adminId, `count=${changed.rows.length}; 사용자 상세에서 전체 기기 해제`]);
        return { found: true, changed: changed.rows.length };
      });
      return result.found ? jsonResponse({ success: true, changed: result.changed }) : jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    if (action === 'unban') {
      const unbanRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ban_duration: 'none' })
      });
      if (!unbanRes.ok) throw new Error('Failed to unban user in Auth: ' + await unbanRes.text());

      await insertAuditLog(env, userId, adminId, 'UNBAN', null);
      return jsonResponse({ success: true, message: `User ${userId} unbanned successfully.` });
    }

    return jsonResponse({ success: false, error: 'Unknown action' }, 400);

  } catch (error) {
    console.error('[Admin API] Error updating user:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
