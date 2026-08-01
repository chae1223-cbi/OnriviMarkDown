require('dotenv').config({ path: '.env.local' });
const { sql } = require('./src/lib/db.js');

async function run() {
  try {
    await sql`
      INSERT INTO common_code_groups (group_code, group_name, description, is_active)
      VALUES ('AUDIT_ACTION', '감사 로그 액션 타입', '사용자 상태 변경 및 관리자 제재 이력 코드', true)
      ON CONFLICT (group_code) DO NOTHING;
    `;
    console.log('Group code created.');

    await sql`
      INSERT INTO common_codes (group_code, code_value, code_name, sort_order, is_active, description)
      VALUES 
        ('AUDIT_ACTION', 'SUSPEND', '계정 정지', 1, true, '관리자에 의한 계정 무기한 정지'),
        ('AUDIT_ACTION', 'UNBAN', '정지 해제', 2, true, '관리자에 의한 계정 정지 해제'),
        ('AUDIT_ACTION', 'KILL_SESSION', '세션 강제 종료', 3, true, '관리자에 의한 활성 기기 세션 강제 종료'),
        ('AUDIT_ACTION', 'USER_WITHDRAW', '회원 탈퇴', 4, true, '사용자 자진 회원 탈퇴'),
        ('AUDIT_ACTION', 'ROLE_CHANGE', '권한 변경', 5, true, '관리자 권한 부여 및 회수')
      ON CONFLICT (group_code, code_value) DO UPDATE 
      SET code_name = EXCLUDED.code_name, description = EXCLUDED.description;
    `;
    console.log('Common codes created.');

    await sql`
      CREATE TABLE IF NOT EXISTS user_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        target_user_id UUID NOT NULL,       
        admin_id UUID,                      
        action_type VARCHAR(50) NOT NULL,   
        reason TEXT,                        
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('Table user_audit_logs created.');

    await sql`CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target ON user_audit_logs(target_user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action_type);`;
    console.log('Indexes created.');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
