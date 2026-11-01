import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transactionsRouter from '../src/routes/transactions.js';
import { initializeDatabase } from '../src/db.js';

const app = express();

const clientOriginEnv = process.env.CLIENT_ORIGIN;
const corsOptions = clientOriginEnv
  ? { origin: clientOriginEnv.split(',').map(o => o.trim()).filter(Boolean) }
  : {};

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));

let initialization;
const ensureDatabase = (_req, _res, next) => {
  initialization ??= initializeDatabase();
  initialization.then(() => next()).catch(next);
};
app.use(ensureDatabase);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CodeNova Expense Tracker API' }));
app.use('/api/transactions', transactionsRouter);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.message?.includes('CORS')) return res.status(403).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error. Please try again.' });
});

export default app;
