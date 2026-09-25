import React from 'react';
import { RefreshIcon } from './common/Icons';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="mark-cell mark-dark" />
            <span className="mark-cell mark-dark" />
            <span className="mark-cell mark-dark" />
            <span className="mark-cell mark-light" />
          </div>
          <div className="brand-copy">
            <h1 className="brand-title">Qcode Studio</h1>
            <span className="brand-badge">UTILITY</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="badge-stamp" title="All QR generation and diagnostics execute entirely in your browser.">
            <span className="stamp-dot" />
            <span>100% Client-Side</span>
          </div>

          <button
            type="button"
            className="btn-tactile btn-reset"
            onClick={onReset}
            title="Reset editor to initial defaults"
          >
            <RefreshIcon size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
