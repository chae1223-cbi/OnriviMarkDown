/**
 * 프로그램명 : 라이선스 기기 활성화/등록 API Route (insert/route.ts)
 * 버전 정보 : 1.0.1
 * 프로그램 ID : OMD-API-licenseInsert-0001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.07.05> 최초작성
 * 🚨 @PATCH : **2026-09-16** — [데스크탑 1대 / 웹 1대 독립 엄격 제한 적용]: Elite Pro 플랜에서 데스크탑끼리 비교하여 1대, 웹 브라우저끼리 비교하여 1대만 편집 가능한 전체사용자로 허용하도록 webCount >= 1 검사로 엄격화
 * 🚨 @PATCH : **2026-09-16** — [좀비 세션 자동 정리 및 Elite Pro 분리 집계 한도 교정]: 2분 이상 비활성 웹 세션 자동 정리 가드 추가, Elite Pro 웹 세션 상한을 max_devices(2대) 기준으로 교정하여 브라우저 재접속 시 동시 접속 초과 오탐지 차단
 * -----------------------------------------------------------------------
 */
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { insertLicenseActivationQuery } from '@/lib/db/queries/licenseQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { p_license_id, p_device_uuid, p_device_name, p_user_id, p_is_expired, p_force_takeover } = body;

    if (!p_license_id || !p_device_uuid || !p_device_name) {
      return NextResponse.json({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }, { status: 400 });
    }

    // UUID 유효성 검증 방어 코드 ("undefined", "null" 등의 문자열 방지)
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const validUserId = (p_user_id && isValidUUID(p_user_id)) ? p_user_id : null;

    try {
      const result = await insertLicenseActivationQuery(
        sql, 
        p_license_id, 
        p_device_uuid, 
        p_device_name, 
        validUserId, 
        p_is_expired === true,
        p_force_takeover === true
      );
      return NextResponse.json(result);
    } catch (dbError: any) {
      console.warn('[/api/rpc/license/insert] Postgres direct query failed, falling back to Supabase Admin REST:', dbError?.message);

      // 🛡️ Supabase Admin REST Fallback (PgBouncer/트랜잭션 오류 시 안전 자동 폴백)
      const { data: subRows, error: subErr } = await supabaseAdmin
        .from('subscriptions')
        .select('max_devices, plan_name, user_id')
        .eq('id', p_license_id)
        .limit(1);

      if (subErr || !subRows || subRows.length === 0) {
        return NextResponse.json({ success: false, code: 'ERROR', message: '구독/라이선스 정보를 찾을 수 없습니다.' }, { status: 200 });
      }

      const { max_devices, plan_name, user_id: subOwnerId } = subRows[0];
      const effectiveUserId = validUserId || (subOwnerId && isValidUUID(subOwnerId) ? subOwnerId : null);
      const nowIso = new Date().toISOString();
      const isElitePro = plan_name?.toUpperCase().replace(/\s/g, '').includes('ELITE');
      const isDesktopReq = p_device_name?.toLowerCase().includes('desktop');

      // 🧹 [좀비 세션 자동 정리 가드]: 2분 이상 활동(Heartbeat)이 중단된 웹 세션은 자동 비활성화하여 오탐지 방지
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('license_activations')
        .update({ is_active: false, updated_at: nowIso })
        .eq('subscription_id', p_license_id)
        .eq('is_active', true)
        .not('device_name', 'ilike', '%desktop%')
        .lt('updated_at', twoMinutesAgo);

      // ⚡ 제어권 강제 인수 시 타 활성 세션 비활성화 (웹 인수 시 데스크탑 세션 보존)
      if (p_force_takeover && !p_is_expired && plan_name?.toUpperCase() !== 'READER') {
        let deactQuery = supabaseAdmin
          .from('license_activations')
          .update({ is_active: false, updated_at: nowIso })
          .eq('subscription_id', p_license_id)
          .neq('device_uuid', p_device_uuid)
          .eq('is_active', true);

        if (isElitePro) {
          if (isDesktopReq) {
            deactQuery = deactQuery.ilike('device_name', '%desktop%');
          } else {
            deactQuery = deactQuery.not('device_name', 'ilike', '%desktop%');
          }
        }
        await deactQuery;
      }

      // 2. 기존 동일 기기 세션 확인
      const { data: existingAct } = await supabaseAdmin
        .from('license_activations')
        .select('id, is_active')
        .eq('subscription_id', p_license_id)
        .eq('device_uuid', p_device_uuid)
        .limit(1);

      let newIsActive = true;
      if (p_is_expired || plan_name?.toUpperCase() === 'READER') {
        newIsActive = false;
      }

      if (newIsActive && max_devices !== null && max_devices > 0) {
        const { data: activeSessions } = await supabaseAdmin
          .from('license_activations')
          .select('id, device_name')
          .eq('subscription_id', p_license_id)
          .eq('is_active', true)
          .neq('device_uuid', p_device_uuid);

        const list = activeSessions || [];
        if (isElitePro) {
          const desktopCount = list.filter((s: any) => s.device_name?.toLowerCase().includes('desktop')).length;
          const webCount = list.filter((s: any) => !s.device_name?.toLowerCase().includes('desktop')).length;
          if (isDesktopReq && desktopCount >= 1) newIsActive = false;
          else if (!isDesktopReq && webCount >= 1) newIsActive = false;
        } else {
          if (list.length >= max_devices) newIsActive = false;
        }
      }

      let activationId = existingAct && existingAct.length > 0 ? existingAct[0].id : null;
      if (activationId) {
        await supabaseAdmin
          .from('license_activations')
          .update({
            activated_at: nowIso,
            updated_at: nowIso,
            is_active: newIsActive,
            device_name: p_device_name,
            updated_by: effectiveUserId
          })
          .eq('id', activationId);
      } else {
        const { data: inserted } = await supabaseAdmin
          .from('license_activations')
          .insert({
            subscription_id: p_license_id,
            device_uuid: p_device_uuid,
            device_name: p_device_name,
            activated_at: nowIso,
            updated_at: nowIso,
            is_active: newIsActive,
            created_by: effectiveUserId,
            updated_by: effectiveUserId
          })
          .select('id');
        if (inserted && inserted.length > 0) activationId = inserted[0].id;
      }

      if (!newIsActive) {
        return NextResponse.json({ success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices: 1, activation_id: activationId });
      }

      return NextResponse.json({ success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.', activation_id: activationId });
    }
  } catch (error: any) {
    console.error('[/api/rpc/license/insert] Error:', error);
    return NextResponse.json({ success: false, code: 'SERVER_ERROR', message: error.message }, { status: 200 });
  }
}
