import React, { useState } from 'react';
import type { QRCustomization } from '../../types/qr';
import { downloadBatchZip } from '../../utils/export';
import { CloseIcon, DownloadIcon, GridIcon } from '../common/Icons';

interface BatchModalProps {
  customization: QRCustomization;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', message: string) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  customization,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState(
    'https://github.com/google, Google GitHub\nhttps://react.dev, React Docs\nhttps://developer.mozilla.org, MDN Web'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const lines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedItems = lines.map((line) => {
    const commaIndex = line.indexOf(',');
    if (commaIndex !== -1) {
      const payload = line.slice(0, commaIndex).trim();
      const name = line.slice(commaIndex + 1).trim();
      return { payload, name: name || payload };
    }
    return { payload: line, name: line };
  });

  const handleDownloadZip = async () => {
    if (parsedItems.length === 0) return;
    setIsProcessing(true);

    try {
      await downloadBatchZip(parsedItems, customization);
      onShowToast('success', `Batch ZIP created with ${parsedItems.length} QR codes.`);
      onClose();
    } catch {
      onShowToast('warning', 'Failed to generate batch ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="batch-modal-title" className="modal-title">Batch QR Generator</h2>
            <span className="modal-badge">CLIENT ZIP</span>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="batch-hint">
            Enter one URL or text string per line. You can optionally add a comma followed by a custom file label (e.g., <code>https://mysite.com, My Site</code>).
          </p>

          <textarea
            className="batch-textarea"
            rows={7}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="https://example.com/one, Item 1&#10;https://example.com/two, Item 2"
          />

          <div className="batch-status-bar">
            <div className="batch-count-info">
              <GridIcon size={14} />
              <span>{parsedItems.length} code{parsedItems.length === 1 ? '' : 's'} queued for rendering</span>
            </div>

            <button
              type="button"
              className="btn-export-primary btn-batch-run"
              onClick={handleDownloadZip}
              disabled={parsedItems.length === 0 || isProcessing}
            >
              <DownloadIcon size={15} />
              <span>{isProcessing ? 'GENERATING ZIP...' : 'DOWNLOAD ZIP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
