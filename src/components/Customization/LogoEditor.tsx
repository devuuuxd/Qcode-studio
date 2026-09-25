import React, { useRef } from 'react';
import { ImageIcon, TrashIcon, AlertTriangleIcon } from '../common/Icons';

interface LogoEditorProps {
  logoDataUrl: string | null;
  logoSize: number;
  errorCorrectionLevel: string;
  onUpdateLogo: (dataUrl: string | null) => void;
  onUpdateLogoSize: (size: number) => void;
  onRemoveLogo: () => void;
}

export const LogoEditor: React.FC<LogoEditorProps> = ({
  logoDataUrl,
  logoSize,
  errorCorrectionLevel,
  onUpdateLogo,
  onUpdateLogoSize,
  onRemoveLogo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="tool-section">
      <div className="tool-section-header">
        <span className="tool-section-title">Center Logo</span>
        {logoDataUrl ? (
          <span className="stamp-pill stamp-pill-ink">{logoSize}% Size</span>
        ) : (
          <span className="tool-meta-tag">Optional</span>
        )}
      </div>

      {!logoDataUrl ? (
        <div className="logo-upload-box">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            id="logo-upload-input"
            onChange={handleFileChange}
          />
          <label htmlFor="logo-upload-input" className="logo-upload-label">
            <ImageIcon size={18} />
            <span className="upload-cta">Upload Logo Image</span>
            <span className="upload-hint">PNG, SVG, or JPG (max 2MB)</span>
          </label>
        </div>
      ) : (
        <div className="logo-active-controls">
          <div className="logo-preview-row">
            <div className="logo-thumb-wrapper">
              <img src={logoDataUrl} alt="QR Logo Preview" className="logo-thumbnail" />
            </div>

            <div className="logo-info-group">
              <span className="logo-status-title">Logo Attached</span>
              <button
                type="button"
                className="btn-logo-remove"
                onClick={onRemoveLogo}
                title="Remove logo"
              >
                <TrashIcon size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="logo-size-slider-row">
            <div className="slider-label-row">
              <label htmlFor="logo-size-range" className="slider-label">
                Logo Scale
              </label>
              <span className="dimension-stamp">{logoSize}%</span>
            </div>
            <input
              id="logo-size-range"
              type="range"
              min={12}
              max={28}
              step={1}
              value={logoSize}
              onChange={(e) => onUpdateLogoSize(Number(e.target.value))}
              className="tactile-range-slider"
            />
          </div>

          {errorCorrectionLevel !== 'H' && (
            <div className="logo-ecl-notice">
              <AlertTriangleIcon size={12} />
              <span>High (H) Error Correction recommended with logos to preserve scannability.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
