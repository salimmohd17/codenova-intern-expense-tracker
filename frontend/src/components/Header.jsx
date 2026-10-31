import { ArrowDownUp } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-logo">
            <ArrowDownUp size={20} />
          </div>
          <span className="brand-name">pocket<span>wise</span></span>
        </div>
        <div className="header-right">
          <span className="workspace-chip">Personal workspace</span>
          <button className="help-btn" aria-label="Help">?</button>
        </div>
      </div>
    </header>
  );
}
