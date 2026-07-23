export const insertLicenseActivationQuery = async (db: any, licenseId: string, deviceUuid: string, deviceName: string, userId: string | null = null) => {
  return db.begin(async (tx: any) => {
    // 1. 해당 구독(subscriptions) 정보 조회
    const licenseInfo = await tx`
      SELECT max_devices
      FROM subscriptions
      WHERE id = ${licenseId}
    `;

    if (licenseInfo.length === 0) {
      throw new Error('구독/라이선스 정보를 찾을 수 없습니다.');
    }

    const { max_devices } = licenseInfo[0];

    // 2. 기존 동일 기기 세션 확인
    const currentDeviceRes = await tx`
      SELECT is_active
      FROM license_activations
      WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
    `;
    
    let isCurrentlyActive = false;
    let newIsActive = true;

    if (currentDeviceRes.length > 0) {
      isCurrentlyActive = currentDeviceRes[0].is_active;
      
      // 3. max_devices 제한 검사 (현재 기기가 활성 상태가 아니었던 경우에만 검사)
      if (!isCurrentlyActive && max_devices !== null && max_devices > 0) {
        const activeCountRes = await tx`
          SELECT COUNT(*) as count
          FROM license_activations
          WHERE subscription_id = ${licenseId} AND is_active = true
        `;
        const count = parseInt(activeCountRes[0].count, 10);
        if (count >= max_devices) {
          newIsActive = false;
        }
      }

      // 기존 기록 UPDATE (DELETE 후 INSERT 하면 Supabase Realtime DELETE 이벤트가 발생해 다른 탭이 강제 로그아웃됨)
      await tx`
        UPDATE license_activations
        SET activated_at = now(), updated_at = now(), is_active = ${newIsActive}, device_name = ${deviceName}
        WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
      `;
    } else {
      // 3. max_devices 제한 검사 (완전 신규 기기)
      if (max_devices !== null && max_devices > 0) {
        const activeCountRes = await tx`
          SELECT COUNT(*) as count
          FROM license_activations
          WHERE subscription_id = ${licenseId} AND is_active = true
        `;
        const count = parseInt(activeCountRes[0].count, 10);
        if (count >= max_devices) {
          newIsActive = false;
        }
      }

      // 4. 신규 세션 등록
      if (userId) {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, created_by, updated_by, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${userId}, ${userId}, ${newIsActive})
        `;
      } else {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, is_active)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${newIsActive})
        `;
      }
    }

    if (!newIsActive) {
      return { success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices };
    }

    return { success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.' };
  });
};
