import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import transactionsRouter from './routes/transactions.js';
import { db } from './db.js';

const app = express();
const port = Number(process.env.PORT) || 5002;
// If CLIENT_ORIGIN is set restrict to those origins; otherwise allow all origins
const clientOriginEnv = process.env.CLIENT_ORIGIN;
const corsOptions = clientOriginEnv
  ? { origin: clientOriginEnv.split(',').map(o => o.trim()).filter(Boolean) }
  : {}; // no restriction when not configured

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(express.json({ limit: '20kb' }));

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

const server = app.listen(port, () => {
  console.log(`Expense Tracker API running on port ${port}`);
  console.log(`SQLite database ready at ${process.env.DATABASE_PATH || 'backend/data/expenses.db'}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


