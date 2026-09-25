import React, { useState } from 'react';
import { CopyIcon, CheckIcon, CloseIcon, ShareIcon } from '../common/Icons';
import { copyTextToClipboard } from '../../utils/export';

interface ShareModalProps {
  shareUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', message: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  shareUrl,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      onShowToast('success', 'Share URL copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="share-modal-title" className="modal-title">Share Configuration</h2>
            <span className="modal-badge">CLIENT-ONLY</span>
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
          <p className="io-block-desc">
            This URL contains your complete QR configuration encoded entirely in the URL hash. No data is ever sent to or stored on any server.
          </p>

          <div className="share-url-input-combo">
            <input
              type="text"
              className="text-input share-url-input"
              value={shareUrl}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className="btn-tactile btn-copy-share"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckIcon size={14} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="share-privacy-note">
            <ShareIcon size={14} />
            <span>Anyone opening this link will see your exact payload, colors, pattern, and margins loaded directly into their editor.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
