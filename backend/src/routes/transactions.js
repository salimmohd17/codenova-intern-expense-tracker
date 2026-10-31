import { Router } from 'express';
import { db, getSummary } from '../db.js';
import { validateTransaction } from '../validation.js';

const router = Router();

router.get('/summary', (_req, res) => {
  res.json({ summary: getSummary() });
});

router.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const type = typeof req.query.type === 'string' ? req.query.type : 'all';
  if (!['all', 'income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type filter must be all, income, or expense.' });
  }
  const conditions = [];
  const params = {};
  if (type !== 'all') {
    conditions.push('type = @type');
    params.type = type;
  }
  if (search) {
    conditions.push('(LOWER(title) LIKE @search ESCAPE \'\\\' OR LOWER(category) LIKE @search ESCAPE \'\\\' OR LOWER(notes) LIKE @search ESCAPE \'\\\')');
    params.search = `%${search.toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const transactions = db.prepare(`
    SELECT id, type, title, amount, category, date, notes, created_at AS createdAt
    FROM transactions ${where}
    ORDER BY date DESC, id DESC
  `).all(params);
  res.json({ transactions });
});

router.post('/', (req, res) => {
  const result = validateTransaction(req.body || {});
  if (!result.valid) {
    return res.status(400).json({ message: 'Please correct the transaction details.', errors: result.errors });
  }
  const { type, title, amount, category, date, notes } = result.value;
  const insert = db.prepare(`
    INSERT INTO transactions (type, title, amount, category, date, notes)
    VALUES (@type, @title, @amount, @category, @date, @notes)
  `);
  const info = insert.run({ type, title, amount, category, date, notes });
  const transaction = db.prepare(`
    SELECT id, type, title, amount, category, date, notes, created_at AS createdAt
    FROM transactions WHERE id = ?
  `).get(info.lastInsertRowid);
  res.status(201).json({ message: 'Transaction created.', transaction, summary: getSummary() });
});

router.delete('/:id', (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ message: 'Transaction ID must be a positive integer.' });
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ message: 'Transaction was not found.' });
  res.json({ message: 'Transaction deleted.', summary: getSummary() });
});

export default router;
