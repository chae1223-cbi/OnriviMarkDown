/**
 * 프로그램명 : 라이선스 활성화 쿼리 유틸 (licenseQueries.ts)
 * 버전 정보 : 1.0.0
 * 프로그램 ID : oaar-license-queries-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.07.05> 최초작성
//             **2026-09-16** — [좀비 세션 자동 정리 및 Elite Pro 분리 집계 한도 교정]: 2분 이상 비활성 웹 세션 자동 정리 쿼리 추가, Elite Pro 웹 세션 상한을 max_devices(2대) 기준으로 교정하여 브라우저 재접속 시 동시 접속 초과 오탐지 차단
//             **2026-09-16** — [UUID 유효성 검증 및 subscription 소유자 UUID 자동 승격]: userId가 이메일 주소 등 비-UUID 문자열로 유입될 때 Postgres UUID 구문 오류를 방지하기 위해 subscriptions.user_id로 자동 보정하고, UPDATE 시에도 updated_by 갱신 연동
//             **2026-09-05** — 다른 브라우저/기기에서 동시접속 초과 시 편집 제어권을 가져올 수 있도록 forceTakeover 인수 지원 (동일 타입의 타 활성 세션 자동 비활성화)
//             **2026-09-05** — 세션 등록 및 갱신 시 activation_id 반환 지원으로 클라이언트 단의 세션별 소유권 식별 보장
//             **2026-08-12** — 기기 재접속 시 동시접속 한도 검사를 우회하여 제한사용자가 정품으로 뚫리는 버그 수정을 위해 checkLimits 시 본인 세션을 제외하고 세는 로직 도입 및 !isCurrentlyActive 우회 가드 해제 적용
 * -----------------------------------------------------------------------
 */
export const insertLicenseActivationQuery = async (
  db: any, 
  licenseId: string, 
  deviceUuid: string, 
  deviceName: string, 
  userId: string | null = null, 
  isExpired: boolean = false,
  forceTakeover: boolean = false
) => {
  return db.begin(async (tx: any) => {
    // 1. 해당 구독(subscriptions) 정보 조회
    const licenseInfo = await tx`
      SELECT max_devices, plan_name, user_id
      FROM subscriptions
      WHERE id = ${licenseId}
    `;

    if (licenseInfo.length === 0) {
      throw new Error('구독/라이선스 정보를 찾을 수 없습니다.');
    }

    const { max_devices, plan_name, user_id: subOwnerId } = licenseInfo[0];
    const isValidUUID = (id: any) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const effectiveUserId = (userId && isValidUUID(userId)) ? userId : (subOwnerId && isValidUUID(subOwnerId) ? subOwnerId : null);

    const isElitePro = plan_name?.toUpperCase().replace(/\s/g, '').includes('ELITE');
    const isDesktopReq = deviceName?.toLowerCase().includes('desktop');

    // 🧹 [좀비 세션 자동 정리 가드]: 2분 이상 활동(Heartbeat)이 중단된 웹 세션은 자동 비활성화하여 오탐지 방지
    await tx`
      UPDATE license_activations
      SET is_active = false, updated_at = now()
      WHERE subscription_id = ${licenseId}
        AND is_active = true
        AND LOWER(device_name) NOT LIKE '%desktop%'
        AND updated_at < (now() - interval '2 minutes')
    `;

    // ⚡ 제어권 강제 인수(forceTakeover) 요청 시: 동일 플랜 내 다른 활성 세션을 비활성화하여 현재 기기 승격
    if (forceTakeover && !isExpired && plan_name?.toUpperCase() !== 'READER') {
      if (isElitePro) {
        if (isDesktopReq) {
          await tx`
            UPDATE license_activations
            SET is_active = false, updated_at = now()
            WHERE subscription_id = ${licenseId}
              AND device_uuid != ${deviceUuid}
              AND LOWER(device_name) LIKE '%desktop%'
              AND is_active = true
          `;
        } else {
          await tx`
            UPDATE license_activations
            SET is_active = false, updated_at = now()
            WHERE subscription_id = ${licenseId}
              AND device_uuid != ${deviceUuid}
              AND LOWER(device_name) NOT LIKE '%desktop%'
              AND is_active = true
          `;
        }
      } else {
        await tx`
          UPDATE license_activations
          SET is_active = false, updated_at = now()
          WHERE subscription_id = ${licenseId}
            AND device_uuid != ${deviceUuid}
            AND is_active = true
        `;
      }
    }

    const checkLimits = async () => {
      if (max_devices !== null && max_devices > 0) {
        const activeSessions = await tx`
          SELECT id, device_name, activated_at
          FROM license_activations
          WHERE subscription_id = ${licenseId} 
            AND is_active = true
            AND device_uuid != ${deviceUuid} -- 💡 본인 기기 세션은 카운트에서 제외하여 오판 방지
          ORDER BY activated_at ASC
        `;

        if (isElitePro) {
          const desktopSessions = activeSessions.filter((s: any) => s.device_name?.toLowerCase().includes('desktop'));
          const webSessions = activeSessions.filter((s: any) => !s.device_name?.toLowerCase().includes('desktop'));
          
          if (isDesktopReq && desktopSessions.length >= 1) {
            return false;
          } else if (!isDesktopReq && webSessions.length >= (max_devices || 2)) {
            return false;
          }
        } else {
          if (activeSessions.length >= max_devices) {
            return false;
          }
        }
      }
      return true;
    };

    // 2. 기존 동일 기기 세션 확인
    const currentDeviceRes = await tx`
      SELECT id, is_active
      FROM license_activations
      WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
    `;
    
    let isCurrentlyActive = false;
    let newIsActive = true;
    let activationId: string | null = null;

    // 1차 필터: READER 요금제이거나 명시적 만료 상태면 무조건 제한 사용자(is_active = false)
    if (isExpired || plan_name?.toUpperCase() === 'READER') {
      newIsActive = false;
    }

    if (currentDeviceRes.length > 0) {
      activationId = currentDeviceRes[0].id;
      isCurrentlyActive = currentDeviceRes[0].is_active;
      
      // 3. max_devices 제한 검사 (1차 필터 통과 시 isCurrentlyActive 상태에 관계없이 무조건 항상 검사)
      if (newIsActive) {
        newIsActive = await checkLimits();
      }
      // 이미 활성이면서 1차 필터 통과(newIsActive===true)면 계속 true 유지 (checkLimits 생략)

      // 기존 기록 UPDATE (DELETE 후 INSERT 하면 Supabase Realtime DELETE 이벤트가 발생해 다른 탭이 강제 로그아웃됨)
      if (effectiveUserId) {
        await tx`
          UPDATE license_activations
          SET activated_at = now(), updated_at = now(), is_active = ${newIsActive}, device_name = ${deviceName}, updated_by = ${effectiveUserId}
          WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
        `;
      } else {
        await tx`
          UPDATE license_activations
          SET activated_at = now(), updated_at = now(), is_active = ${newIsActive}, device_name = ${deviceName}
          WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
        `;
      }
    } else {
      // 3. max_devices 제한 검사 (완전 신규 기기, 1차 필터 통과시에만)
      if (newIsActive) {
        newIsActive = await checkLimits();
      }

      // 4. 신규 세션 등록
      if (effectiveUserId) {
        const ins = await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, created_by, updated_by, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${effectiveUserId}, ${effectiveUserId}, ${newIsActive})
          RETURNING id
        `;
        if (ins && ins.length > 0) activationId = ins[0].id;
      } else {
        const ins = await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${newIsActive})
          RETURNING id
        `;
        if (ins && ins.length > 0) activationId = ins[0].id;
      }
    }

    if (!newIsActive) {
      return { success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하거나 만료(READER)되어 제한 모드로 연결됩니다.', max_devices, activation_id: activationId };
    }

    return { success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.', activation_id: activationId };
  });
};
