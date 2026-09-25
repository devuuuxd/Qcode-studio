import React, { useState } from 'react';
import type { HistoryItem } from '../../types/qr';
import {
  TrashIcon,
  RefreshIcon,
  PinIcon,
  EditIcon,
  CheckIcon,
  SearchIcon,
  CloseIcon,
} from '../common/Icons';

interface RecentListProps {
  items: HistoryItem[];
  filteredItems: HistoryItem[];
  activeId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRestoreItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onTogglePin: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
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
  filteredItems,
  activeId,
  searchQuery,
  onSearchChange,
  onRestoreItem,
  onDeleteItem,
  onClearAll,
  onTogglePin,
  onRenameItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const handleStartRename = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditNameValue(item.customName || item.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRenameItem(id, editNameValue);
    setEditingId(null);
  };

  return (
    <div className="recent-tape-container">
      <div className="tape-header">
        <div className="tape-heading-group">
          <span className="tape-title">RECENT CODES</span>
          {items.length > 0 && <span className="tape-count">{items.length}</span>}
        </div>

        <div className="tape-actions-group">
          {items.length > 3 && (
            <div className="tape-search-wrap">
              <SearchIcon size={12} className="search-icon-decor" />
              <input
                type="text"
                className="tape-search-input"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn-search-clear"
                  onClick={() => onSearchChange('')}
                  title="Clear search"
                >
                  <CloseIcon size={11} />
                </button>
              )}
            </div>
          )}

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
      </div>

      {items.length === 0 ? (
        <div className="tape-empty">
          <p>No recent codes yet. Codes you configure are saved to local browser storage.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="tape-empty">
          <p>No codes match "{searchQuery}".</p>
        </div>
      ) : (
        <div className="tape-grid">
          {filteredItems.map((item) => {
            const isActive = activeId === item.id;
            const isEditing = editingId === item.id;
            const displayName = item.customName || item.title;

            return (
              <div
                key={item.id}
                className={`tape-item ${isActive ? 'item-active' : ''} ${item.pinned ? 'item-pinned' : ''}`}
              >
                <div className="tape-item-main" onClick={() => onRestoreItem(item)}>
                  <div className="tape-item-top">
                    <div className="type-pin-badge-group">
                      <span className="tape-type-tag">{item.type}</span>
                      {item.pinned && <span className="pinned-star" title="Pinned">★</span>}
                    </div>
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

                    {isEditing ? (
                      <form
                        className="rename-inline-form"
                        onSubmit={(e) => handleSaveRename(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          className="rename-inline-input"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          autoFocus
                          maxLength={32}
                        />
                        <button
                          type="button"
                          className="btn-inline-save"
                          onClick={(e) => handleSaveRename(item.id, e)}
                          title="Save label"
                        >
                          <CheckIcon size={11} />
                        </button>
                      </form>
                    ) : (
                      <span className="tape-item-title" title={displayName}>
                        {displayName}
                      </span>
                    )}
                  </div>

                  <div className="tape-item-footer">
                    <span className="tape-restore-prompt">
                      <RefreshIcon size={11} />
                      <span>Restore</span>
                    </span>
                  </div>
                </div>

                <div className="tape-item-action-rail">
                  <button
                    type="button"
                    className={`btn-tape-action ${item.pinned ? 'btn-pinned' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(item.id);
                    }}
                    title={item.pinned ? 'Unpin from top' : 'Pin to top'}
                    aria-label={item.pinned ? 'Unpin code' : 'Pin code'}
                  >
                    <PinIcon size={12} />
                  </button>

                  <button
                    type="button"
                    className="btn-tape-action"
                    onClick={(e) => handleStartRename(item, e)}
                    title="Rename / Label code"
                    aria-label="Rename code"
                  >
                    <EditIcon size={12} />
                  </button>

                  <button
                    type="button"
                    className="btn-tape-action btn-tape-del"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
