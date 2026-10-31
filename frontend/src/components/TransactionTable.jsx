import { ArrowDownLeft, ArrowUpRight, Search, Trash2, ReceiptText } from 'lucide-react';

const money = value => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(Number(value || 0));
const dateLabel = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

export default function TransactionTable({ transactions, search, setSearch, filter, setFilter, onDelete, deletingId }) {
  return (
    <section className="panel history-panel">
      <div className="history-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h2>Recent transactions</h2><p className="section-subtitle">A clear view of where your money goes.</p></div>
        <span className="count-pill">{transactions.length} records</span>
      </div>
      <div className="history-controls">
        <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." aria-label="Search transactions" /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter transactions">
          <option value="all">All transactions</option><option value="income">Income only</option><option value="expense">Expenses only</option>
        </select>
      </div>
      {transactions.length === 0 ? (
        <div className="empty-state"><span><ReceiptText size={25} /></span><h3>No transactions found</h3><p>Add a transaction or change your search filters.</p></div>
      ) : (
        <>
          <div className="desktop-table-wrap">
            <table>
              <thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{transactions.map(item => (
                <tr key={item.id}>
                  <td><div className="transaction-title"><span className={`transaction-icon ${item.type}`}>{item.type === 'income' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div><strong>{item.title}</strong>{item.notes && <small>{item.notes}</small>}</div></div></td>
                  <td><span className={`category-badge ${item.type}`}>{item.category}</span></td>
                  <td className="date-cell">{dateLabel(item.date)}</td>
                  <td className={`amount-cell ${item.type}`}>{item.type === 'income' ? '+' : ''}{money(item.amount)}</td>
                  <td><button className="delete-button" onClick={() => onDelete(item)} disabled={deletingId === item.id} aria-label={`Delete ${item.title}`} title="Delete transaction"><Trash2 size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="mobile-transactions">{transactions.map(item => (
            <article className="mobile-transaction" key={item.id}>
              <div className="mobile-transaction-main"><span className={`transaction-icon ${item.type}`}>{item.type === 'income' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div className="mobile-transaction-copy"><strong>{item.title}</strong><span>{item.category}  {dateLabel(item.date)}</span></div><strong className={`amount-cell ${item.type}`}>{item.type === 'income' ? '+' : ''}{money(item.amount)}</strong></div>
              <button className="mobile-delete" onClick={() => onDelete(item)} disabled={deletingId === item.id}><Trash2 size={15} /> Delete</button>
            </article>
          ))}</div>
        </>
      )}
    </section>
  );
}
