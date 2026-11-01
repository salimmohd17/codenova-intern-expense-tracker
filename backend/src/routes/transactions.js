import { Router } from 'express';
import { query, getSummary } from '../db.js';
import { validateTransaction } from '../validation.js';

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
    res.json({ summary: await getSummary() });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const type = typeof req.query.type === 'string' ? req.query.type : 'all';
  if (!['all', 'income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type filter must be all, income, or expense.' });
  }
  const conditions = [];
  const params = [];
  if (type !== 'all') {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(`(LOWER(title) LIKE LOWER(${placeholder}) OR LOWER(category) LIKE LOWER(${placeholder}) OR LOWER(notes) LIKE LOWER(${placeholder}))`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const result = await query(`
      SELECT id, type, title, amount, category, to_char(date, 'YYYY-MM-DD') AS date,
             notes, created_at AS "createdAt"
      FROM transactions ${where}
      ORDER BY date DESC, id DESC
    `, params);
    res.json({ transactions: result.rows.map((row) => ({ ...row, amount: Number(row.amount) })) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const result = validateTransaction(req.body || {});
  if (!result.valid) {
    return res.status(400).json({ message: 'Please correct the transaction details.', errors: result.errors });
  }
  const { type, title, amount, category, date, notes } = result.value;
  try {
    const inserted = await query(`
      INSERT INTO transactions (type, title, amount, category, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, type, title, amount, category,
                to_char(date, 'YYYY-MM-DD') AS date, notes, created_at AS "createdAt"
    `, [type, title, amount, category, date, notes]);
    const transaction = { ...inserted.rows[0], amount: Number(inserted.rows[0].amount) };
    res.status(201).json({ message: 'Transaction created.', transaction, summary: await getSummary() });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ message: 'Transaction ID must be a positive integer.' });
  try {
    const deleted = await query('DELETE FROM transactions WHERE id = $1', [Number(req.params.id)]);
    if (deleted.rowCount === 0) return res.status(404).json({ message: 'Transaction was not found.' });
    res.json({ message: 'Transaction deleted.', summary: await getSummary() });
  } catch (error) {
    next(error);
  }
});

export default router;
