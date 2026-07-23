/**
 * 🎯 @KICK  : subscribe_desktop_plan Supabase RPC를 서버단 API Route로 대체
 * 🚨 @PATCH : 2026-07-22 — supabase.rpc('subscribe_desktop_plan') 제거 및 네이티브 DML(insert/update)로 로직 전면 이관
 *             subscriptions 단일 테이블 구조에 맞게 서버 코드단에서 라이선스 키 생성 및 삽입 처리
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function generateHex(size: number) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_user_id, p_device_uuid, p_device_name } = body;

    if (!p_user_id || !p_device_uuid) {
      return NextResponse.json({ success: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const periodEndTs = new Date(Date.now() + 365 * 86400000).toISOString();

    // 1. 기존 구독 만료 처리
    await supabaseAdmin
      .from('subscriptions')
      .update({ plan_status: 'EXPIRED', is_active: false, updated_at: now })
      .eq('user_id', p_user_id);

    // 2. 신규 데스크탑 구독 생성
    const subId = crypto.randomUUID();
    const licenseKey = `OMD-${generateHex(4)}-${generateHex(4)}`;
    const verifyKey = generateHex(8);
    const paymentNo = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateHex(4)}`;

    const { error: insertSubError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        id: subId,
        created_by: p_user_id,
        updated_by: p_user_id,
        user_id: p_user_id,
        plan_name: 'ELITEPRO',
        plan_status: 'ACTIVE',
        billing_cycle: 'YEARLY',
        license_key: licenseKey,
        verify_key: verifyKey,
        payment_no: paymentNo,
        max_devices: 2,
        current_period_start: now,
        current_period_end: periodEndTs,
        is_active: true,
        created_at: now,
        updated_at: now
      });

    if (insertSubError) {
      console.error('[/api/subscription/subscribe-desktop] Sub Insert error:', insertSubError);
      return NextResponse.json({ success: false, message: insertSubError.message || '구독 생성 실패' }, { status: 500 });
    }

    // 3. 기기 활성화
    const { error: deviceError } = await supabaseAdmin
      .from('license_activations')
      .insert({
        subscription_id: subId,
        device_uuid: p_device_uuid,
        device_name: p_device_name || 'Desktop App',
        activated_at: now
      });

    if (deviceError) {
      console.error('[/api/subscription/subscribe-desktop] Device Insert error:', deviceError);
      // 기기 등록 실패하더라도 플랜 자체는 생성됨. 일단 에러 무시하거나 응답은 성공으로 할 수 있음.
    }

    return NextResponse.json({
      success: true,
      message: '데스크탑 구독이 활성화되었습니다.',
      license_key: licenseKey,
      verify_key: verifyKey,
      payment_no: paymentNo,
      subscription_id: subId,
    });
  } catch (error: any) {
    console.error('[/api/subscription/subscribe-desktop] Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
