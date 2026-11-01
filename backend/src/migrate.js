import 'dotenv/config';
import { initializeDatabase, closeDatabase } from './db.js';

try {
  await initializeDatabase();
  console.log('Database migrations completed successfully.');
} catch (error) {
  console.error('Database migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
