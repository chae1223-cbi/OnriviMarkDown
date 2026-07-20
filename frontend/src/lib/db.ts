import postgres from 'postgres';

// Ensure this file is only used in server-side code (API routes or Server Actions)
// Note: Supabase Postgres URL format is required: postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:6543/postgres
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not defined in environment variables. Database transactions will fail.');
}

// Connection options for connecting to Supabase via Postgres directly
export const sql = postgres(connectionString, {
  max: 10, // Max number of connections
  idle_timeout: 20, // Max idle time in seconds
  connect_timeout: 10,
});
