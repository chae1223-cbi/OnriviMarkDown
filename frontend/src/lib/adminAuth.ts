import { supabaseAdmin } from './supabaseAdmin';

export function hasVerifiedAdminMfa(token: string, userId: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return payload.sub === userId && payload.aal === 'aal2';
  } catch {
    return false;
  }
}

export async function verifyAdmin(request: Request, requireSuper: boolean = false) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return { user: null, error: 'Unauthorized (No token)' };

    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return { user: null, error: 'Unauthorized (Invalid bearer token)' };
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return { user: null, error: 'Unauthorized (Invalid token)' };
    }
    if (!hasVerifiedAdminMfa(token, user.id)) {
      return { user: null, error: 'Forbidden (MFA required)' };
    }

    const { data: adminUser } = await supabaseAdmin.from('admins').select('admin_role').eq('user_id', user.id).single();
    if (!adminUser || !['SUPER', 'SUPPORT'].includes(adminUser.admin_role)) {
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
