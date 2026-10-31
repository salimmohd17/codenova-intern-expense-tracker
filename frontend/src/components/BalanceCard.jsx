import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';

const icons = {
  income: <ArrowDownLeft size={20} />,
  expenses: <ArrowUpRight size={20} />,
  savings: <CreditCard size={20} />,
};

export default function BalanceCard({ kind, label, amount, subtitle }) {
  return (
    <div className="balance-card">
      <div className="balance-card-header">
        <span className="balance-label">{label}</span>
        <span className={`balance-icon balance-icon--${kind}`}>{icons[kind]}</span>
      </div>
      <p className="balance-amount">{amount}</p>
      <p className="balance-subtitle">{subtitle}</p>
    </div>
  );
}
