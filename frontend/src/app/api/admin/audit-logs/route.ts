import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId parameter is required' }, { status: 400 });
    }

    // Fetch audit logs for the user, join with common_codes for friendly action names
    // Also try to fetch admin email if admin_id is present
    const logs = await sql`
      SELECT 
        l.id,
        l.action_type as raw_action,
        COALESCE(c.code_name, l.action_type) as action_name,
        l.reason,
        l.created_at,
        l.admin_id,
        u.email as admin_email
      FROM user_audit_logs l
      LEFT JOIN common_codes c ON c.group_code = 'AUDIT_ACTION' AND c.code_value = l.action_type
      LEFT JOIN users u ON u.id = l.admin_id
      WHERE l.target_user_id = ${userId}
      ORDER BY l.created_at DESC
    `;

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('[/api/admin/audit-logs] Error fetching logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
