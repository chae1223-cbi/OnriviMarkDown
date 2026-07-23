import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_activation_id, p_payment_no, p_device_uuid } = body;

    // 1. Activation ID로 바로 삭제하는 경우 (대시보드 기기 해제)
    if (p_activation_id) {
      const { data, error } = await supabase
        .from('license_activations')
        .delete()
        .eq('id', p_activation_id)
        .select();

      if (error) {
        return NextResponse.json({ success: false, code: 'ERROR', message: error.message });
      }
      if (!data || data.length === 0) {
        return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '해당 기기 접속 정보를 찾을 수 없습니다.' });
      }
      return NextResponse.json({ success: true, code: 'SUCCESS', message: '기기가 해제되었습니다.' });
    }

    // 2. 결제번호 + 디바이스 UUID로 삭제하는 경우 (에디터 로그아웃)
    if (p_payment_no && p_device_uuid) {
      const { data: licenses, error: licError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('payment_no', p_payment_no)
        .limit(1);
        
      if (licError) return NextResponse.json({ success: false, code: 'ERROR', message: licError.message });

      if (!licenses || licenses.length === 0) {
        return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '해당 결제번호의 구독 정보를 찾을 수 없습니다.' });
      }

      const v_license_id = licenses[0].id;

      const { data: deleted, error: delError } = await supabase
        .from('license_activations')
        .delete()
        .eq('subscription_id', v_license_id)
        .eq('device_uuid', p_device_uuid)
        .select();

      if (delError) return NextResponse.json({ success: false, code: 'ERROR', message: delError.message });

      if (!deleted || deleted.length === 0) {
        return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '해당 세션을 찾을 수 없습니다.' });
      }

      return NextResponse.json({ success: true, code: 'SUCCESS', message: '세션이 해제되었습니다.' });
    }

    return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' });
  } catch (error: any) {
    console.error('[/api/device/deactivate] Transaction failed:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
