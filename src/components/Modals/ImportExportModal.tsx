import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import type { QRType, AnyFormData, QRCustomization, ConfigExport } from '../../types/qr';
import { exportConfiguration, validateAndParseConfig } from '../../utils/storage';
import { parseDecodedPayload } from '../../utils/qrPayload';
import { DownloadIcon, UploadIcon, CloseIcon, CheckIcon, ImageIcon } from '../common/Icons';

interface ImportExportModalProps {
  currentType: QRType;
  currentFormData: AnyFormData;
  currentCustomization: QRCustomization;
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (type: QRType, formData: AnyFormData, customization: QRCustomization) => void;
  onShowToast: (type: 'success' | 'warning' | 'info', message: string) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  currentType,
  currentFormData,
  currentCustomization,
  isOpen,
  onClose,
  onApplyConfig,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'scan'>('json');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsedConfig, setParsedConfig] = useState<ConfigExport | null>(null);

  const [scanResult, setScanResult] = useState<{
    raw: string;
    type: QRType;
    formData: AnyFormData;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const config = exportConfiguration(currentType, currentFormData, currentCustomization);
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qcode-config-${currentType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Configuration exported as JSON.');
  };

  const handleJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonError(null);
    setParsedConfig(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const res = validateAndParseConfig(reader.result);
        if (res.valid && res.data) {
          setParsedConfig(res.data);
        } else {
          setJsonError(res.error || 'Failed to parse configuration file.');
        }
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const handleApplyParsedJson = () => {
    if (!parsedConfig) return;
    onApplyConfig(parsedConfig.type, parsedConfig.formData, parsedConfig.customization);
    onShowToast('success', `Imported ${parsedConfig.type.toUpperCase()} configuration.`);
    onClose();
  };

  const handleScanImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScanResult(null);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setScanError('Could not create image context.');
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      URL.revokeObjectURL(url);

      if (code && code.data) {
        const parsed = parseDecodedPayload(code.data);
        setScanResult({
          raw: code.data,
          type: parsed.type,
          formData: parsed.formData,
        });
      } else {
        setScanError('No QR code could be optically detected in this image.');
      }
    };
    img.onerror = () => {
      setScanError('Failed to read image file.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleApplyScanned = () => {
    if (!scanResult) return;
    onApplyConfig(scanResult.type, scanResult.formData, currentCustomization);
    onShowToast('success', `Decoded & loaded ${scanResult.type.toUpperCase()} QR.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="modal-title" className="modal-title">Config & QR Tools</h2>
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

        <div className="modal-tabs-strip">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'json' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON Configuration
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'scan' ? 'tab-selected' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            Scan Existing QR Image
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'json' && (
            <div className="modal-tab-content">
              <div className="io-section-block">
                <span className="io-block-title">Export Current Setup</span>
                <p className="io-block-desc">
                  Download all current QR parameters, styling, colors, and content as a standalone JSON file.
                </p>
                <button
                  type="button"
                  className="btn-tactile btn-export-io"
                  onClick={handleExportJson}
                >
                  <DownloadIcon size={14} />
                  <span>Download Config JSON</span>
                </button>
              </div>

              <div className="io-separator" />

              <div className="io-section-block">
                <span className="io-block-title">Import JSON File</span>
                <p className="io-block-desc">
                  Load a previously exported JSON configuration file. The schema is validated before applying.
                </p>

                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden-file-input"
                  id="json-file-input"
                  onChange={handleJsonFile}
                />
                <label htmlFor="json-file-input" className="io-file-dropzone">
                  <UploadIcon size={16} />
                  <span>Choose JSON File</span>
                </label>

                {jsonError && (
                  <div className="io-error-banner" role="alert">
                    <span>{jsonError}</span>
                  </div>
                )}

                {parsedConfig && (
                  <div className="io-preview-card">
                    <div className="io-preview-header">
                      <span className="io-preview-type">{parsedConfig.type.toUpperCase()} CONFIG</span>
                      <span className="io-preview-stamp">Validated</span>
                    </div>
                    <p className="io-preview-meta">
                      Size: {parsedConfig.customization.size}px · Colors: {parsedConfig.customization.fgColor} on {parsedConfig.customization.bgColor} · ECL: {parsedConfig.customization.errorCorrectionLevel}
                    </p>
                    <button
                      type="button"
                      className="btn-tactile btn-apply-io"
                      onClick={handleApplyParsedJson}
                    >
                      <CheckIcon size={14} />
                      <span>Apply to Editor</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'scan' && (
            <div className="modal-tab-content">
              <div className="io-section-block">
                <span className="io-block-title">Decode Existing QR Image</span>
                <p className="io-block-desc">
                  Upload an image containing a QR code. It will be optically decoded in your browser and mapped into the editor.
                </p>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  id="scan-image-input"
                  onChange={handleScanImage}
                />
                <label htmlFor="scan-image-input" className="io-file-dropzone">
                  <ImageIcon size={18} />
                  <span>Select QR Image (PNG, JPG, WebP)</span>
                </label>

                {scanError && (
                  <div className="io-error-banner" role="alert">
                    <span>{scanError}</span>
                  </div>
                )}

                {scanResult && (
                  <div className="io-preview-card">
                    <div className="io-preview-header">
                      <span className="io-preview-type">DETECTED {scanResult.type.toUpperCase()}</span>
                      <span className="io-preview-stamp">Decoded</span>
                    </div>
                    <pre className="io-scanned-raw">
                      <code>{scanResult.raw}</code>
                    </pre>
                    <button
                      type="button"
                      className="btn-tactile btn-apply-io"
                      onClick={handleApplyScanned}
                    >
                      <CheckIcon size={14} />
                      <span>Load into Editor</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
