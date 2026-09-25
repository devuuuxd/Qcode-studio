import React, { useState } from 'react';
import { CodeIcon, CopyIcon, CheckIcon } from '../common/Icons';
import { copyTextToClipboard } from '../../utils/export';

interface PayloadInspectorProps {
  payload: string;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({ payload }) => {
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
          <span>Raw Encoded Payload</span>
        </span>
        <span className="inspector-bytes-count">
          {new TextEncoder().encode(payload).length} bytes
        </span>
      </button>

      {isOpen && (
        <div className="inspector-content-box">
          <div className="inspector-header">
            <span className="inspector-label">Exact string encoded into the matrix:</span>
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
            <code>{payload || '// (No payload generated yet)'}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
