import { useState } from 'react';
import { Plus } from 'lucide-react';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Housing', 'Utilities', 'Healthcare', 'Education', 'Entertainment', 'Shopping', 'Other'],
};

const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({ type: 'expense', title: '', amount: '', category: 'Food', date: today(), notes: '' });

export default function TransactionForm({ onSubmit, busy }) {
  const [form, setForm] = useState(empty());
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'type') next.category = CATEGORIES[value][0];
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit({ ...form, amount: Number(form.amount) });
    if (ok) { setForm(empty()); setErrors({}); }
  }

  const cats = CATEGORIES[form.type] || [];

  return (
    <section className="panel form-panel">
      <p className="eyebrow">NEW ENTRY</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Add transaction</h2>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--green-light)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={18} />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form" noValidate>
        {/* Expense / Income toggle */}
        <div className="type-row">
          {['expense', 'income'].map(t => (
            <label key={t} className={`type-chip ${t} ${form.type === t ? 'active' : ''}`}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} />
              {t === 'expense'
                ? <><ArrowExpense /> Expense</>
                : <><ArrowIncome /> Income</>
              }
            </label>
          ))}
        </div>

        <div className="form-field">
          <label htmlFor="title">Description</label>
          <input
            id="title" value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Weekly groceries" maxLength={100} required
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="amount">Amount</label>
          <div className="amount-input-wrap">
            <span className="amount-prefix">KSh</span>
            <input
              id="amount" type="number" min="0.01" step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="0.00" required
            />
          </div>
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={e => set('category', e.target.value)} required>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="notes">Notes <span className="optional">(optional)</span></label>
          <textarea
            id="notes" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={2} maxLength={500} placeholder="Add a note..."
          />
        </div>

        <button type="submit" className="submit-btn" disabled={busy}>
          <Plus size={17} /> {busy ? 'Saving…' : 'Add transaction'}
        </button>
      </form>
    </section>
  );
}

function ArrowExpense() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
}
function ArrowIncome() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>;
}
