import React from 'react';
import type { ThemeMode } from '../types/qr';
import {
  RefreshIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ShareIcon,
  UploadIcon,
  GridIcon,
} from './common/Icons';

interface HeaderProps {
  theme: ThemeMode;
  onCycleTheme: () => void;
  onOpenShare: () => void;
  onOpenImportExport: () => void;
  onOpenBatch: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onCycleTheme,
  onOpenShare,
  onOpenImportExport,
  onOpenBatch,
  onReset,
}) => {
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
          <div
            className="badge-stamp client-stamp-hide-mobile"
            title="All QR generation and diagnostics execute entirely in your browser."
          >
            <span className="stamp-dot" />
            <span>100% Client-Side</span>
          </div>

          <button
            type="button"
            className="btn-tactile btn-header-action"
            onClick={onOpenBatch}
            title="Batch generate multiple QR codes"
          >
            <GridIcon size={13} />
            <span className="btn-label-desktop">Batch</span>
          </button>

          <button
            type="button"
            className="btn-tactile btn-header-action"
            onClick={onOpenImportExport}
            title="Import/Export JSON or scan QR code"
          >
            <UploadIcon size={13} />
            <span className="btn-label-desktop">Config</span>
          </button>

          <button
            type="button"
            className="btn-tactile btn-header-action"
            onClick={onOpenShare}
            title="Share current QR configuration via link"
          >
            <ShareIcon size={13} />
            <span className="btn-label-desktop">Share</span>
          </button>

          <button
            type="button"
            className="btn-tactile btn-header-theme"
            onClick={onCycleTheme}
            title={`Current theme: ${theme.toUpperCase()}. Click to cycle (System -> Light -> Dark).`}
            aria-label="Toggle display theme"
          >
            {theme === 'light' && <SunIcon size={13} />}
            {theme === 'dark' && <MoonIcon size={13} />}
            {theme === 'system' && <MonitorIcon size={13} />}
            <span className="theme-name-tag">{theme.toUpperCase()}</span>
          </button>

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
