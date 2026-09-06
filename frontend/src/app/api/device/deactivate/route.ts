// ====================================================================
// 📊 [OMD-AUTH-device-deactivate-0001 ✅ FIXED] /api/device/deactivate
// 🎯 @KICK  : 대시보드 기기 해제 및 에디터 로그아웃 시 접속 세션(license_activations) 안전 해제
// 🛡️ @GUARD : p_user_id 소유권 검증 가드 (타 계정 기기 무단 해제 원천 차단)
// 🚨 @PATCH : **2026-09-05** — 기기 해제 시 p_user_id 기반의 구독/세션 소유권 교차 검증 로직 추가 및 supabaseAdmin 적용
// 🔗 @CALLS : supabaseAdmin.from('license_activations'), supabaseAdmin.from('subscriptions')
// ====================================================================
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_activation_id, p_payment_no, p_device_uuid, p_user_id } = body;

    // 1. Activation ID로 바로 삭제하는 경우 (대시보드 기기 해제)
    if (p_activation_id) {
      // 🚨 @PATCH : 2026-09-05 사용자 소유권 검증 (p_user_id 전달 시 해당 유저의 구독/세션인지 검증)
      if (p_user_id) {
        const { data: actRow, error: actErr } = await supabaseAdmin
          .from('license_activations')
          .select('id, created_by, subscription_id')
          .eq('id', p_activation_id)
          .maybeSingle();

        if (actErr || !actRow) {
          return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '해당 기기 접속 정보를 찾을 수 없습니다.' });
        }

        // created_by가 일치하거나 구독 소유자인지 확인
        let isOwner = actRow.created_by === p_user_id;
        if (!isOwner && actRow.subscription_id) {
          const { data: subRow } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('id', actRow.subscription_id)
            .maybeSingle();
          if (subRow && subRow.user_id === p_user_id) {
            isOwner = true;
          }
        }

        if (!isOwner) {
          return NextResponse.json({ success: false, code: 'FORBIDDEN', message: '본인의 기기 접속 세션만 해제할 수 있습니다.' }, { status: 403 });
        }
      }

      const { data, error } = await supabaseAdmin
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
      let subQuery = supabaseAdmin
        .from('subscriptions')
        .select('id, user_id')
        .eq('payment_no', p_payment_no);

      if (p_user_id) {
        subQuery = subQuery.eq('user_id', p_user_id);
      }

      const { data: licenses, error: licError } = await subQuery.limit(1);
        
      if (licError) return NextResponse.json({ success: false, code: 'ERROR', message: licError.message });

      if (!licenses || licenses.length === 0) {
        return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '해당 결제번호의 구독 정보를 찾을 수 없습니다.' });
      }

      const v_license_id = licenses[0].id;

      const { data: deleted, error: delError } = await supabaseAdmin
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
