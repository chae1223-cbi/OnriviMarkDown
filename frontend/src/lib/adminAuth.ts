import { supabaseAdmin } from './supabaseAdmin';

export async function verifyAdmin(request: Request, requireSuper: boolean = false) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return { user: null, error: 'Unauthorized (No token)' };

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { user: null, error: 'Unauthorized (Invalid token)' };
    }

    const { data: adminUser } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', user.id).single();
    if (!adminUser) {
      return { user: null, error: 'Forbidden (Not an admin)' };
    }

    if (requireSuper && adminUser.admin_role !== 'SUPER') {
      return { user: null, error: 'Forbidden (SUPER role required)' };
    }

    return { user, adminRole: adminUser.admin_role, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}
