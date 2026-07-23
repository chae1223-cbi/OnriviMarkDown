import postgres from 'postgres';

const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function testQuery() {
  const licenseId = 'f77fa38d-cc39-4448-86de-4cc05bd32999';
  const deviceUuid = 'test-device-' + Date.now();
  const deviceName = 'Web SaaS Test';

  try {
    await sql.begin(async (tx) => {
      // 1. 해당 구독(subscriptions) 정보 조회
      const licenseInfo = await tx`
        SELECT max_devices
        FROM subscriptions
        WHERE id = ${licenseId}
      `;
      if (licenseInfo.length === 0) throw new Error('No subscription');
      const { max_devices } = licenseInfo[0];
      console.log('max_devices:', max_devices);

      // 2. 기존 동일 기기 세션 제거
      await tx`
        DELETE FROM license_activations
        WHERE subscription_id = ${licenseId} AND device_uuid = ${deviceUuid}
      `;

      // 3. max_devices 제한 검사
      if (max_devices !== null && max_devices > 0) {
        const activeCountRes = await tx`
          SELECT COUNT(*) as count
          FROM license_activations
          WHERE subscription_id = ${licenseId}
        `;
        const count = parseInt(activeCountRes[0].count, 10);
        console.log('Current active count:', count);
        if (count >= max_devices) {
          console.log('MAX DEVICES EXCEEDED');
          return;
        }
      }

      // 4. 신규 세션 등록
      console.log('Inserting...');
      await tx`
        INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at)
        VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now())
      `;
      console.log('Insert successful!');
    });
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await sql.end();
  }
}

testQuery();
