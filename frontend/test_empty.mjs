import postgres from 'postgres';
const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function run() {
  try {
    const licenseId = 'f77fa38d-cc39-4448-86de-4cc05bd32999';
    const deviceUuid = 'test-uuid-24';
    const deviceName = 'Test Device 24';
    const userId = '';
    
    await sql.begin(async tx => {
      if (userId) {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at, created_by, updated_by)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now(), ${userId}, ${userId})
        `;
      } else {
        await tx`
          INSERT INTO license_activations (subscription_id, device_uuid, device_name, activated_at)
          VALUES (${licenseId}, ${deviceUuid}, ${deviceName}, now())
        `;
      }
    });
    console.log('Success with empty string');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}
run();
