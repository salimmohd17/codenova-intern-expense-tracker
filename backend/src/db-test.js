import 'dotenv/config';
import { pool, closeDatabase } from './db.js';

try {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS user_name,
      NOW() AS server_time
  `);
  const tables = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  console.log(`Connected to PostgreSQL database "${result.rows[0].database}".`);
  console.log(`Database server time: ${result.rows[0].server_time.toISOString()}`);
  console.log(`Tables: ${tables.rows.map((row) => row.tablename).join(', ')}`);
} catch (error) {
  console.error('PostgreSQL connection failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
