const { Client } = require('pg');

// 데이터베이스 연결 설정 (Supabase PostgreSQL)
const connectionString = 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function executeSql(queryText, params = []) {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(queryText, params);
    return res;
  } catch (error) {
    console.error('❌ DB Query Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

const commands = {
  // 1. 현재 접속 중인 세션(장비) 조회
  viewActivations: async (paymentNo) => {
    if (!paymentNo) {
      console.log("Usage: node db_admin.js viewActivations <payment_no>");
      console.log("Example: node db_admin.js viewActivations PAY-20260628-2F11B90A");
      return;
    }
    const query = `
      SELECT device_uuid, device_name, activated_at, last_active_at 
      FROM license_activations WHERE license_id = (
        SELECT id FROM software_licenses WHERE payment_no = $1
      );
    `;
    const res = await executeSql(query, [paymentNo]);
    console.log(`\n=== 🖥️ Activations for [${paymentNo}] ===`);
    console.table(res.rows);
  },

  // 2. 현재 등록된 RPC 함수 목록 조회
  getRPCs: async () => {
    const query = `
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
      AND proname IN ('insert_license_activation', 'verify_desktop_license');
    `;
    const res = await executeSql(query);
    console.log('\n=== 📜 Registered RPC Functions ===');
    res.rows.forEach(row => {
      console.log(`\n[Function]: ${row.proname}`);
      console.log(row.prosrc.substring(0, 300) + '...\n(truncated)');
    });
  },

  // 3. 테스트용 장비 동시접속 시뮬레이션
  testConcurrentLogin: async (paymentNo) => {
    if (!paymentNo) {
      console.log("Usage: node db_admin.js testConcurrentLogin <payment_no>");
      return;
    }
    const query = `
      SELECT id, subscription_id FROM software_licenses WHERE payment_no = $1
    `;
    const res = await executeSql(query, [paymentNo]);
    if (res.rows.length === 0) {
      console.log('License not found!');
      return;
    }
    const licenseId = res.rows[0].id;
    console.log(`Testing concurrent login for License ID: ${licenseId}`);
    
    for (let i = 1; i <= 3; i++) {
      const mockUuid = \`simulated-device-\${i}-\${Date.now()}\`;
      try {
        const updateRes = await executeSql(`
          SELECT insert_license_activation($1, $2, $3)
        `, [licenseId, mockUuid, \`Simulated Browser \${i}\`]);
        console.log(`✅ Device ${i} inserted/updated:`, updateRes.rows[0].insert_license_activation);
      } catch (err) {
        console.log(`❌ Device ${i} failed:`, err.message);
      }
    }
  }
};

const action = process.argv[2];
const arg = process.argv[3];

if (action && commands[action]) {
  commands[action](arg)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  console.log('=== Onrivi DB Admin Tools ===');
  console.log('Available Commands:');
  Object.keys(commands).forEach(cmd => console.log(`  node db_admin.js ${cmd}`));
}
