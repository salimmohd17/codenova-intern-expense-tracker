import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const configured = process.env.DATABASE_PATH || './data/expenses.db';
const dbPath = path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
  title       TEXT    NOT NULL,
  amount      REAL    NOT NULL CHECK(amount > 0),
  category    TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  notes       TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

export function getSummary() {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
      COUNT(*) AS transactionCount
    FROM transactions
  `).get();
  return {
    totalIncome: row.totalIncome,
    totalExpenses: row.totalExpenses,
    netSavings: row.totalIncome - row.totalExpenses,
    transactionCount: row.transactionCount,
  };
}
