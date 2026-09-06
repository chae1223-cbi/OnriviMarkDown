import postgres from 'postgres';

// Ensure this file is only used in server-side code (API routes or Server Actions)
// Note: Supabase Postgres URL format is required: postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:6543/postgres
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not defined in environment variables. Database transactions will fail.');
}

// Connection options for connecting to Supabase via Postgres directly
// 💡 Supabase Transaction Pooler(PgBouncer:6543) 환경에서 prepared statement not exist(26000) 방어를 위해 prepare: false 필수
export const sql = postgres(connectionString, {
  prepare: false,
  max: 10, // Max number of connections
  idle_timeout: 20, // Max idle time in seconds
  connect_timeout: 10,
});
