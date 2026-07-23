import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { insertLicenseActivationQuery } from '@/lib/db/queries/licenseQueries';
import postgres from 'postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_license_id, p_device_uuid, p_device_name, p_user_id } = body;

    if (!p_license_id || !p_device_uuid || !p_device_name) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }, { status: 400 });
    }

    // UUID 유효성 검증 방어 코드 ("undefined", "null" 등의 문자열 방지)
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const validUserId = (p_user_id && isValidUUID(p_user_id)) ? p_user_id : null;

    // 💡 트랜잭션 함수 호출 시 validUserId 전달
    const result = await insertLicenseActivationQuery(sql, p_license_id, p_device_uuid, p_device_name, validUserId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/rpc/license/insert] Error:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
