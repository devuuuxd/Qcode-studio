import React, { useState } from 'react';
import type { QRType, QRCustomization } from '../../types/qr';
import { CodeIcon, CopyIcon, CheckIcon } from '../common/Icons';
import { copyTextToClipboard } from '../../utils/export';

interface PayloadInspectorProps {
  payload: string;
  type: QRType;
  customization: QRCustomization;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  payload,
  type,
  customization,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    if (!payload) return;
    const ok = await copyTextToClipboard(payload);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const byteLength = new TextEncoder().encode(payload).length;

  return (
    <div className="payload-inspector-container">
      <button
        type="button"
        className="btn-inspector-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="inspector-toggle-title">
          <CodeIcon size={14} />
          <span>Payload Inspector</span>
        </span>
        <span className="inspector-bytes-count">{byteLength} bytes</span>
      </button>

      {isOpen && (
        <div className="inspector-content-box">
          <div className="inspector-meta-grid">
            <div className="inspector-meta-item">
              <span className="meta-key">TYPE</span>
              <span className="meta-val">{type.toUpperCase()}</span>
            </div>
            <div className="inspector-meta-item">
              <span className="meta-key">LENGTH</span>
              <span className="meta-val">{payload.length} chars ({byteLength}B)</span>
            </div>
            <div className="inspector-meta-item">
              <span className="meta-key">ECL</span>
              <span className="meta-val">{customization.errorCorrectionLevel}</span>
            </div>
            <div className="inspector-meta-item">
              <span className="meta-key">MARGIN</span>
              <span className="meta-val">{customization.margin} modules</span>
            </div>
          </div>

          <div className="inspector-header">
            <span className="inspector-label">Exact string encoded into matrix:</span>
            <button
              type="button"
              className="btn-copy-raw"
              onClick={handleCopyText}
              title="Copy raw string"
            >
              {copied ? (
                <>
                  <CheckIcon size={12} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  <span>Copy String</span>
                </>
              )}
            </button>
          </div>
          <pre className="raw-payload-code">
            <code>{payload || '(No payload generated yet)'}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
