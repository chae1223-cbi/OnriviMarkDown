/** 🚨 @PATCH : 2026-10-08 — 세션 해제(kill_session) UUID 정규표현식 5그룹(8-4-4-4-12) 누락 수정 */
/** 🚨 @PATCH : 2026-09-28 — 사용자별 요금제 변경 화면에 현재 주기와 관리자 수동 무료/유료 구분을 제공 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sql } from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';

// Supabase Service Role Key is required to manage users globally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Avoid crashing if keys are missing in build time
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export async function GET(req: Request) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.user) return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'general'; // 'general' or 'admin'
    
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Supabase Admin is not configured.' }, { status: 500 });
    }

    const filterStatus = searchParams.get('status') || 'ALL';
    const filterPlan = searchParams.get('plan') || 'ALL';
    const requestedUserId = searchParams.get('userId');

    if (type === 'general') {
      // 1. Fetch all users and subscriptions (or with a large limit) to apply complex relational filtering in-memory
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const userIds = users.map((u: any) => u.id);
      let subsMap: Record<string, any> = {};
      let subIdToUserIdMap: Record<string, string> = {};
      let subIds: string[] = [];
      
      if (userIds.length > 0) {
        const { data: subs } = await supabaseAdmin.from('subscriptions')
          .select('*')
          .in('user_id', userIds)
          .eq('plan_status', 'ACTIVE'); // Fix: Use plan_status instead of status
          
        if (subs) {
          subs.forEach((s: any) => {
            subsMap[s.user_id] = s;
            subIdToUserIdMap[s.id] = s.user_id;
            subIds.push(s.id);
          });
        }
      }

      // Fetch common_codes for PLAN_NAME
      const { data: codesData } = await supabaseAdmin.from('common_codes')
        .select('code_value, code_name')
        .eq('group_code', 'PLAN_NAME')
        .eq('is_use', true);
      const planCodeMap: Record<string, string> = {};
      if (codesData) {
        codesData.forEach((c: any) => {
          planCodeMap[c.code_value] = c.code_name;
        });
      }

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authMap: Record<string, any> = {};
      if (authUsers?.users) {
        authUsers.users.forEach((au: any) => {
          authMap[au.id] = au;
        });
      }

      // Fetch license activations for active devices
      let activationsMap: Record<string, any[]> = {};
      if (userIds.length > 0) {
        const actsList: any[] = [];
        
        // 1. Fetch by created_by
        const { data: actsByUser } = await supabaseAdmin.from('license_activations')
          .select('id, created_by, subscription_id, device_name, activated_at, is_active')
          .in('created_by', userIds)
          .eq('is_active', true);
        if (actsByUser) actsList.push(...actsByUser);

        // 2. Fetch by subscription_id for apps that don't have created_by set
        if (subIds.length > 0) {
          const { data: actsBySub } = await supabaseAdmin.from('license_activations')
            .select('id, created_by, subscription_id, device_name, activated_at, is_active')
            .in('subscription_id', subIds)
            .eq('is_active', true);
          if (actsBySub) actsList.push(...actsBySub);
        }

        // Deduplicate and map to users
        const seenActs = new Set();
        actsList.forEach((a: any) => {
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

      let formattedData = users.map((u: any) => {
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
          plan_code: rawPlan, // Keep original for filtering
          billing_cycle: sub?.billing_cycle || 'NONE',
          admin_grant_type: String(sub?.payment_no || '').startsWith('ADMIN-FREE-') ? 'FREE' :
            String(sub?.payment_no || '').startsWith('ADMIN-PAID-') ? 'PAID' : null,
          status: currentStatus,
          date: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR') : '-',
          start_date: sub?.current_period_start ? new Date(sub.current_period_start).toISOString().split('T')[0] : '-',
          end_date: sub?.current_period_end ? new Date(sub.current_period_end).toISOString().split('T')[0] : '-',
          devices: activationsMap[u.id] || []
        };
      });

      if (requestedUserId) formattedData = formattedData.filter((u: any) => u.id === requestedUserId);

      // Apply Filters
      if (filterStatus !== 'ALL') {
        formattedData = formattedData.filter((u: any) => u.status === filterStatus);
      }
      if (filterPlan !== 'ALL') {
        formattedData = formattedData.filter((u: any) => {
          if (filterPlan === 'READER') return u.plan_code === 'READER';
          if (filterPlan === 'PRO') return u.plan_code !== 'READER'; // Backwards compatibility for 'PRO'
          return u.plan_code === filterPlan; // Exact match for APPRENTICE, REGULAR, ELITEPRO
        });
      }

      const total = formattedData.length;
      
      // Apply Pagination
      const paginatedData = formattedData.slice((page - 1) * limit, page * limit);

      return NextResponse.json({ success: true, data: paginatedData, total, page, limit });
    } else {
      const { data: admins, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const authMap: Record<string, any> = {};
      if (authUsers?.users) {
        authUsers.users.forEach((au: any) => {
          authMap[au.id] = au;
        });
      }

      let formattedData = admins.map((a: any) => {
        const authUser = authMap[a.id];
        return {
          id: a.id,
          email: a.email,
          nick_name: '-', // Admins table usually doesn't have nickname
          plan: a.role === 'SUPER_ADMIN' ? 'Super Admin' : (a.role || 'Support Admin'),
          status: a.is_active === false ? 'SUSPENDED' : 'ACTIVE',
          date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '-',
          last_login: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('ko-KR') : '-',
          end_date: '-'
        };
      });

      if (filterStatus !== 'ALL') {
        formattedData = formattedData.filter((a: any) => a.status === filterStatus);
      }

      const total = formattedData.length;
      const paginatedData = formattedData.slice((page - 1) * limit, page * limit);

      return NextResponse.json({ success: true, data: paginatedData, total, page, limit });
    }
  } catch (error: any) {
    console.error('[Admin API] Error fetching users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.user) return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    const body = await req.json();
    const { action, userId, reason } = body;
    const adminId = auth.user.id;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Supabase Admin is not configured.' }, { status: 500 });
    }

    if (action === 'suspend') {
      // 1. Ban user via Supabase Auth Admin API (87600h = 10 years)
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });
      if (banError) throw new Error('Failed to ban user in Auth: ' + banError.message);
      
      // 2. Delete their active sessions by finding their subscription_id
      await sql`DELETE FROM license_activations WHERE subscription_id IN (SELECT id FROM subscriptions WHERE user_id = ${userId})`;
      
      // 4. Audit Log
      await sql`
        INSERT INTO user_audit_logs (target_user_id, admin_id, action_type, reason)
        VALUES (${userId}, ${adminId || null}, 'SUSPEND', ${reason || null})
      `;
      
      return NextResponse.json({ success: true, message: `User ${userId} suspended successfully.` });
    }

    if (action === 'kill_single_session') {
      const deviceId = body.deviceId;
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(userId) || !uuid.test(deviceId || '')) return NextResponse.json({ success: false, error: 'Invalid user or device ID' }, { status: 400 });
      const result = await sql.begin(async tx => {
        const found = await tx`SELECT a.id FROM public.license_activations a
          JOIN public.subscriptions s ON s.id = a.subscription_id
          WHERE a.id = ${deviceId}::uuid AND s.user_id = ${userId}::uuid FOR UPDATE OF a`;
        if (!found.length) return { found: false, changed: 0 };
        const changed = await tx`UPDATE public.license_activations SET is_active = false, deactivated_at = now(), updated_at = now(), updated_by = ${adminId}::uuid
          WHERE id = ${deviceId}::uuid AND is_active = true RETURNING id`;
        if (changed.length) await tx`INSERT INTO public.user_audit_logs (target_user_id, admin_id, action_type, reason)
          VALUES (${userId}::uuid, ${adminId}::uuid, 'KILL_SESSION', ${`device=${deviceId}; 사용자 상세에서 기기 해제`})`;
        return { found: true, changed: changed.length };
      });
      if (!result.found) return NextResponse.json({ success: false, error: 'Device not found for user' }, { status: 404 });
      return NextResponse.json({ success: true, changed: result.changed });
    }

    if (action === 'kill_session') {
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(userId)) return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
      const result = await sql.begin(async tx => {
        const found = await tx`SELECT id FROM public.users WHERE id = ${userId}::uuid FOR UPDATE`;
        if (!found.length) return { found: false, changed: 0 };
        const changed = await tx`UPDATE public.license_activations a
          SET is_active = false, deactivated_at = now(), updated_at = now(), updated_by = ${adminId}::uuid
          FROM public.subscriptions s WHERE a.subscription_id = s.id AND s.user_id = ${userId}::uuid AND a.is_active = true RETURNING a.id`;
        if (changed.length) await tx`INSERT INTO public.user_audit_logs (target_user_id, admin_id, action_type, reason)
          VALUES (${userId}::uuid, ${adminId}::uuid, 'KILL_SESSION', ${`count=${changed.length}; 사용자 상세에서 전체 기기 해제`})`;
        return { found: true, changed: changed.length };
      });
      if (!result.found) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      return NextResponse.json({ success: true, changed: result.changed });
    }

    if (action === 'unban') {
      // 1. Unban user via Supabase Auth Admin API
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (unbanError) throw new Error('Failed to unban user in Auth: ' + unbanError.message);

      // 2. Audit Log
      await sql`
        INSERT INTO user_audit_logs (target_user_id, admin_id, action_type)
        VALUES (${userId}, ${adminId || null}, 'UNBAN')
      `;

      return NextResponse.json({ success: true, message: `User ${userId} unbanned successfully.` });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });

  } catch (error: any) {
    console.error('[Admin API] Error updating user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
