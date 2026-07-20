import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_activation_id, p_payment_no, p_device_uuid } = body;

    const result = await sql.begin(async (tx) => {
      // 1. Activation ID로 바로 삭제하는 경우 (대시보드 기기 해제)
      if (p_activation_id) {
        const deleted = await tx`
          DELETE FROM license_activations
          WHERE id = ${p_activation_id}
          RETURNING id
        `;
        if (deleted.length === 0) {
          return { success: false, code: 'NOT_FOUND', message: '해당 기기 접속 정보를 찾을 수 없습니다.' };
        }
        return { success: true, code: 'SUCCESS', message: '기기가 해제되었습니다.' };
      }

      // 2. 결제번호 + 디바이스 UUID로 삭제하는 경우 (에디터 로그아웃)
      if (p_payment_no && p_device_uuid) {
        const licenses = await tx`
          SELECT id FROM software_licenses
          WHERE payment_no = ${p_payment_no}
          LIMIT 1
        `;

        if (licenses.length === 0) {
          return { success: false, code: 'NOT_FOUND', message: '해당 결제번호의 라이선스를 찾을 수 없습니다.' };
        }

        const v_license_id = licenses[0].id;

        const deleted = await tx`
          DELETE FROM license_activations
          WHERE license_id = ${v_license_id}
            AND device_uuid = ${p_device_uuid}
          RETURNING id
        `;

        if (deleted.length === 0) {
          return { success: false, code: 'NOT_FOUND', message: '해당 세션을 찾을 수 없습니다.' };
        }

        return { success: true, code: 'SUCCESS', message: '세션이 해제되었습니다.' };
      }

      return { success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/device/deactivate] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
