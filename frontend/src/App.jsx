import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, RefreshCw, TrendingUp } from 'lucide-react';
import Header from './components/Header.jsx';
import BalanceCard from './components/BalanceCard.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionTable from './components/TransactionTable.jsx';
import Toast from './components/Toast.jsx';
import { api } from './api.js';
import { useServerWakeup } from './useServerWakeup.js';
import './styles.css';

const money = value => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(Number(value || 0));

const WakeupBanner = ({ status }) => {
  if (status === 'ready') return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: status === 'error' ? '#fef2f2' : '#e8f5f0',
      borderBottom: `2px solid ${status === 'error' ? '#fca5a5' : '#6fcfaa'}`,
      padding: '12px 24px', display: 'flex', alignItems: 'center',
      gap: '12px', fontSize: '13px',
      color: status === 'error' ? '#991b1b' : '#1a5c3e',
    }}>
      {status === 'waking' && (
        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #6fcfaa', borderTopColor: '#1a7f5a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      )}
      {status === 'waking'
        ? 'Server is waking up — Render free tier spins down after inactivity. This takes up to 60 s on first load. Please wait...'
        : 'Could not reach the server. Check your connection or try refreshing.'}
    </div>
  );
};

export default function App() {
  const serverStatus = useServerWakeup();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netSavings: 0, transactionCount: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'error') => setToast({ message, type, id: Date.now() }), []);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [list, totals] = await Promise.all([
        api.getTransactions({ search, type: filter }),
        api.getSummary()
      ]);
      setTransactions(list.transactions);
      setSummary(totals.summary);
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }, [search, filter, notify]);

  useEffect(() => { loadData(); }, [loadData]);

  const greetingDate = useMemo(() => new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

  async function addTransaction(transaction) {
    try {
      setBusy(true);
      await api.createTransaction(transaction);
      notify('Transaction saved successfully.', 'success');
      await loadData();
      return true;
    } catch (error) {
      notify(error.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function deleteTransaction(transaction) {
    if (!window.confirm('Delete "' + transaction.title + '"? This cannot be undone.')) return;
    try {
      setDeletingId(transaction.id);
      await api.deleteTransaction(transaction.id);
      notify('Transaction deleted.', 'success');
      await loadData();
    } catch (error) {
      notify(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app-shell">
      <WakeupBanner status={serverStatus} />
      <div style={serverStatus !== 'ready' ? { marginTop: 48 } : {}}>
        <Header />
        <main className="dashboard">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR FINANCIAL OVERVIEW</p>
              <h1>Money, <span>in perspective.</span></h1>
              <p className="welcome-copy">Make every shilling count. Track your income, manage expenses, and stay in control.</p>
            </div>
            <div className="date-chip"><CalendarDays size={17} /><span>{greetingDate}</span></div>
          </section>

          <section className="summary-grid" aria-label="Financial summary">
            <BalanceCard kind="income" label="Total income" amount={money(summary.totalIncome)} subtitle="Money coming in" />
            <BalanceCard kind="expenses" label="Total expenses" amount={money(summary.totalExpenses)} subtitle="Money going out" />
            <BalanceCard kind="savings" label="Net savings" amount={money(summary.netSavings)} subtitle="Income minus expenses" />
          </section>

          <section className="insight-strip">
            <span className="insight-icon"><TrendingUp size={19} /></span>
            <p><strong>{summary.transactionCount} transactions recorded.</strong> Your dashboard totals are calculated from your saved records.</p>
            <button onClick={loadData} className="refresh-button" disabled={loading}><RefreshCw size={15} /> Refresh</button>
          </section>

          <div className="content-grid">
            <TransactionForm onSubmit={addTransaction} busy={busy} />
            <TransactionTable
              transactions={transactions} search={search} setSearch={setSearch}
              filter={filter} setFilter={setFilter}
              onDelete={deleteTransaction} deletingId={deletingId}
            />
          </div>

          <footer className="footer">
            <span>pocketwise &middot; CodeNova Full Stack Internship &middot; Task 2 &middot; &copy; {new Date().getFullYear()} Salim Mwamkoba</span>
            <span>Designed by <a href="https://salim-mwamkoba.netlify.app" target="_blank" rel="noreferrer">BMS Techs</a></span>
          </footer>
        </main>
        <Toast key={toast?.id || 'empty'} toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
