import postgres from 'postgres';

const db = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function run() {
  const licenseId = 'f77fa38d-cc39-4448-86de-4cc05bd32999';
  const deviceUuid = 'session-test-123';
  const deviceName = 'Web SaaS';
  const userId = '112e845c-279c-482d-8b09-bba9f0d11ebf'; // from previous test_user_sub output

  try {
    const result = await db.begin(async (tx) => {
      const licenseInfo = await tx`
        SELECT max_devices
        FROM subscriptions
        WHERE id = ${licenseId}
      `;
      if (licenseInfo.length === 0) {
        throw new Error('구독/라이선스 정보를 찾을 수 없습니다.');
      }
      const { max_devices } = licenseInfo[0];

      const currentDeviceRes = await tx`
        SELECT is_active
        FROM license_activations
        WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
      `;
      let isCurrentlyActive = false;
      if (currentDeviceRes.length > 0) {
        isCurrentlyActive = currentDeviceRes[0].is_active;
        await tx`
          DELETE FROM license_activations
          WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
        `;
      }

      let newIsActive = true;
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

      if (!newIsActive) {
        return { success: false, code: 'EXCEED_MAX_DEVICES', message: '동시접속 기기 수를 초과하여 제한 모드로 연결됩니다.', max_devices };
      }
      return { success: true, code: 'SUCCESS', message: '기기가 활성화되었습니다.' };
    });
    console.log(result);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  } finally {
    process.exit(0);
  }
}
run();
