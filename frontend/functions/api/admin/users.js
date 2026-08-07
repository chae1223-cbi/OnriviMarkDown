import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin, executeDeleteActivations, insertAuditLog } from './_shared.js';

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

    const supabaseAdmin = getSupabaseAdmin(env);

    if (type === 'general') {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const userIds = users.map(u => u.id);
      let subsMap = {};
      let subIdToUserIdMap = {};
      let subIds = [];
      
      if (userIds.length > 0) {
        // Supabase REST limits typically to 1000 items in 'in' queries, so this might need chunking if scale is large
        const { data: subs } = await supabaseAdmin.from('subscriptions')
          .select('*')
          .in('user_id', userIds)
          .eq('plan_status', 'ACTIVE');
          
        if (subs) {
          subs.forEach(s => {
            subsMap[s.user_id] = s;
            subIdToUserIdMap[s.id] = s.user_id;
            subIds.push(s.id);
          });
        }
      }

      const { data: codesData } = await supabaseAdmin.from('common_codes')
        .select('code_value, code_name')
        .eq('group_code', 'PLAN_NAME')
        .eq('is_use', true);
      const planCodeMap = {};
      if (codesData) {
        codesData.forEach(c => {
          planCodeMap[c.code_value] = c.code_name;
        });
      }

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authMap = {};
      if (authUsers?.users) {
        authUsers.users.forEach(au => {
          authMap[au.id] = au;
        });
      }

      let activationsMap = {};
      if (userIds.length > 0) {
        const actsList = [];
        
        const { data: actsByUser } = await supabaseAdmin.from('license_activations')
          .select('id, created_by, subscription_id, device_name, activated_at, is_active')
          .in('created_by', userIds)
          .eq('is_active', true);
        if (actsByUser) actsList.push(...actsByUser);

        if (subIds.length > 0) {
          const { data: actsBySub } = await supabaseAdmin.from('license_activations')
            .select('id, created_by, subscription_id, device_name, activated_at, is_active')
            .in('subscription_id', subIds)
            .eq('is_active', true);
          if (actsBySub) actsList.push(...actsBySub);
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
          status: currentStatus,
          date: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR') : '-',
          start_date: sub?.current_period_start ? new Date(sub.current_period_start).toISOString().split('T')[0] : '-',
          end_date: sub?.current_period_end ? new Date(sub.current_period_end).toISOString().split('T')[0] : '-',
          devices: activationsMap[u.id] || []
        };
      });

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
      const { data: admins, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authMap = {};
      if (authUsers?.users) {
        authUsers.users.forEach(au => {
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
          date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR') : '-',
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
    const { action, userId, reason, adminId } = body;

    if (!userId || !action) {
      return jsonResponse({ success: false, error: 'Missing parameters' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin(env);

    if (action === 'suspend') {
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });
      if (banError) throw new Error('Failed to ban user in Auth: ' + banError.message);
      
      const { data: subs } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', userId);
      const subIds = subs ? subs.map(s => s.id) : [];
      await executeDeleteActivations(supabaseAdmin, subIds, [userId], null);
      await insertAuditLog(supabaseAdmin, userId, adminId, 'SUSPEND', reason);
      
      return jsonResponse({ success: true, message: `User ${userId} suspended successfully.` });
    }

    if (action === 'kill_single_session') {
      const deviceId = body.deviceId;
      if (!deviceId) throw new Error('Missing deviceId for kill_single_session');
      
      await executeDeleteActivations(supabaseAdmin, null, null, deviceId);
      await insertAuditLog(supabaseAdmin, userId, adminId, 'KILL_SESSION', null);

      return jsonResponse({ success: true, message: `Session ${deviceId} terminated.` });
    }

    if (action === 'kill_session') {
      const { data: subs } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', userId);
      const subIds = subs ? subs.map(s => s.id) : [];
      await executeDeleteActivations(supabaseAdmin, subIds, [userId], null);
      await insertAuditLog(supabaseAdmin, userId, adminId, 'KILL_SESSION', null);

      return jsonResponse({ success: true, message: `User ${userId} sessions terminated.` });
    }

    if (action === 'unban') {
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (unbanError) throw new Error('Failed to unban user in Auth: ' + unbanError.message);

      await insertAuditLog(supabaseAdmin, userId, adminId, 'UNBAN', null);
      return jsonResponse({ success: true, message: `User ${userId} unbanned successfully.` });
    }

    return jsonResponse({ success: false, error: 'Unknown action' }, 400);

  } catch (error) {
    console.error('[Admin API] Error updating user:', error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
