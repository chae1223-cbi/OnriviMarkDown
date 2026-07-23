import postgres from 'postgres';

const sql = postgres('postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', { max: 1 });

async function testCheckSession() {
  const licenseId = 'f77fa38d-cc39-4448-86de-4cc05bd32999'; // Note: check-session uses payment_no, but let's query directly to see if updated_at works
  const deviceUuid = 'test-device-123'; // Some random or existing
  
  try {
    const actRows = await sql`
      SELECT id
      FROM license_activations
      WHERE subscription_id = ${licenseId}
      LIMIT 1
    `;
    console.log('actRows:', actRows);
    
    if (actRows.length > 0) {
      console.log('Testing UPDATE updated_at...');
      await sql`
        UPDATE license_activations
        SET updated_at = now()
        WHERE id = ${actRows[0].id}
      `;
      console.log('UPDATE successful!');
    } else {
      console.log('No rows to test UPDATE.');
    }
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await sql.end();
  }
}

testCheckSession();
