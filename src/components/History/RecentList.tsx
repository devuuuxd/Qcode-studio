import React from 'react';
import type { HistoryItem } from '../../types/qr';
import { TrashIcon, RefreshIcon } from '../common/Icons';

interface RecentListProps {
  items: HistoryItem[];
  activeId?: string;
  onRestoreItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export const RecentList: React.FC<RecentListProps> = ({
  items,
  activeId,
  onRestoreItem,
  onDeleteItem,
  onClearAll,
}) => {
  return (
    <div className="recent-tape-container">
      <div className="tape-header">
        <div className="tape-heading-group">
          <span className="tape-title">RECENT CODES</span>
          {items.length > 0 && <span className="tape-count">{items.length}</span>}
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="btn-tape-clear"
            onClick={onClearAll}
            title="Clear all stored codes"
          >
            <TrashIcon size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="tape-empty">
          <p>No recent codes yet. Codes you configure are saved to local browser storage.</p>
        </div>
      ) : (
        <div className="tape-grid">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className={`tape-item ${isActive ? 'item-active' : ''}`}
              >
                <button
                  type="button"
                  className="tape-item-main"
                  onClick={() => onRestoreItem(item)}
                  title="Click to restore into editor"
                >
                  <div className="tape-item-top">
                    <span className="tape-type-tag">{item.type}</span>
                    <span className="tape-time">{formatRelativeTime(item.timestamp)}</span>
                  </div>

                  <div className="tape-item-title-row">
                    <span
                      className="tape-mini-swatch"
                      style={{
                        backgroundColor: item.customization.bgColor,
                        borderColor: 'var(--ink)',
                      }}
                    >
                      <span
                        className="tape-swatch-core"
                        style={{ backgroundColor: item.customization.fgColor }}
                      />
                    </span>
                    <span className="tape-item-title" title={item.title}>
                      {item.title}
                    </span>
                  </div>

                  <div className="tape-item-footer">
                    <span className="tape-restore-prompt">
                      <RefreshIcon size={11} />
                      <span>Restore</span>
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn-tape-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  title="Delete from history"
                  aria-label="Delete code from history"
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
