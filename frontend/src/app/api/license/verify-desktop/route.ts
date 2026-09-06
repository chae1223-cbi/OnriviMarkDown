// ====================================================================
// 📊 [OMD-AUTH-verify-desktop-0001 ✅ FIXED] /api/license/verify-desktop
// 🎯 @KICK  : 데스크탑 앱 실행 시 이메일 기반 라이선스 인증 및 Desktop 기기 세션 안전 등록
// 🛡️ @GUARD : 데스크탑 1대 한도 검사 및 활성 구독(ELITEPRO / DESKTOP) 검증 가드
// 🚨 @PATCH : **2026-09-05** — 제거된 PostgreSQL RPC(verify_desktop_license) 의존성 완전 탈피 및 서버사이드 직접 조회/등록 로직 전환
// 🔗 @CALLS : supabaseAdmin.from('users'), supabaseAdmin.from('subscriptions'), supabaseAdmin.from('license_activations')
// ====================================================================
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_email, p_device_uuid, p_force_takeover } = body;

    if (!p_email || !p_device_uuid) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const cleanEmail = p_email.trim().toLowerCase();

    // 1. 사용자 조회 (users 테이블)
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (userErr || !userRow) {
      return NextResponse.json({ success: false, code: 'NOT_FOUND', message: '등록되지 않은 이메일입니다.' });
    }

    // 2. 데스크탑 사용 가능한 활성 구독 조회 (ELITEPRO 또는 DESKTOP)
    const { data: subs, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userRow.id)
      .eq('is_active', true)
      .in('plan_status', ['ACTIVE', 'FREE'])
      .order('current_period_end', { ascending: false });

    if (subErr || !subs || subs.length === 0) {
      return NextResponse.json({ success: false, code: 'NO_PLAN', message: '활성화된 구독이 없습니다.' });
    }

    const desktopSub = subs.find((s: any) => 
      s.plan_name?.toUpperCase().includes('ELITE') || 
      s.plan_name?.toUpperCase().includes('DESKTOP')
    );

    if (!desktopSub) {
      return NextResponse.json({ success: false, code: 'NO_PLAN', message: '데스크탑을 지원하는 요금제(ELITEPRO) 구독이 없습니다.' });
    }

    // 3. 기존 동일 기기 세션 확인
    const { data: existingAct } = await supabaseAdmin
      .from('license_activations')
      .select('*')
      .eq('subscription_id', desktopSub.id)
      .eq('device_uuid', p_device_uuid)
      .maybeSingle();

    const nowIso = new Date().toISOString();

    // ⚡ 제어권 인수(forceTakeover) 요청 시 타 활성 데스크탑 세션 비활성화
    if (p_force_takeover) {
      await supabaseAdmin
        .from('license_activations')
        .update({
          is_active: false,
          updated_at: nowIso
        })
        .eq('subscription_id', desktopSub.id)
        .neq('device_uuid', p_device_uuid)
        .ilike('device_name', '%desktop%')
        .eq('is_active', true);
    }

    if (existingAct) {
      // 기존 세션 갱신 (Desktop App 명칭 보장)
      await supabaseAdmin
        .from('license_activations')
        .update({
          updated_at: nowIso,
          activated_at: nowIso,
          is_active: true,
          device_name: 'Desktop App'
        })
        .eq('id', existingAct.id);

      return NextResponse.json({
        success: true,
        code: 'SUCCESS',
        message: '데스크탑 기기가 확인되었습니다.',
        verify_key: desktopSub.verify_key || '',
        payment_no: desktopSub.payment_no || '',
        license_key: desktopSub.license_key || '',
        plan_name: desktopSub.plan_name || 'ELITEPRO',
        next_payment_date: desktopSub.current_period_end
      });
    }

    // 4. 신규 기기 등록 시 데스크탑 동시접속 한도 검사 (데스크탑 1대)
    const { data: activeDesktopSessions } = await supabaseAdmin
      .from('license_activations')
      .select('id')
      .eq('subscription_id', desktopSub.id)
      .eq('is_active', true)
      .ilike('device_name', '%desktop%');

    if (activeDesktopSessions && activeDesktopSessions.length >= 1) {
      return NextResponse.json({
        success: false,
        code: 'ERR_MAX_DEVICES_EXCEEDED',
        message: '데스크탑 동시 접속 허용 대수(1대)를 초과했습니다. 웹 대시보드에서 기존 데스크탑 기기를 해제해 주세요.',
        max_devices: 1,
        verify_key: desktopSub.verify_key || '',
        payment_no: desktopSub.payment_no || '',
        license_key: desktopSub.license_key || '',
        plan_name: desktopSub.plan_name || 'ELITEPRO',
        next_payment_date: desktopSub.current_period_end
      });
    }

    // 5. 신규 데스크탑 세션 등록
    await supabaseAdmin
      .from('license_activations')
      .insert({
        subscription_id: desktopSub.id,
        device_uuid: p_device_uuid,
        device_name: 'Desktop App',
        is_active: true,
        created_by: userRow.id,
        updated_by: userRow.id,
        activated_at: nowIso,
        updated_at: nowIso
      });

    return NextResponse.json({
      success: true,
      code: 'SUCCESS',
      message: '데스크탑 기기가 성공적으로 등록되었습니다.',
      verify_key: desktopSub.verify_key || '',
      payment_no: desktopSub.payment_no || '',
      license_key: desktopSub.license_key || '',
      plan_name: desktopSub.plan_name || 'ELITEPRO',
      next_payment_date: desktopSub.current_period_end
    });

  } catch (error: any) {
    console.error('[/api/license/verify-desktop] Error:', error);
    return NextResponse.json({ success: false, code: 'ERROR', message: error.message }, { status: 500 });
  }
}
