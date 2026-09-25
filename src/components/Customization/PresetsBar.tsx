import React from 'react';
import type { QRPreset, QRCustomization } from '../../types/qr';
import { QR_PRESETS } from '../../utils/presets';

interface PresetsBarProps {
  currentCustomization: QRCustomization;
  activePresetId: string | null;
  onSelectPreset: (preset: QRPreset) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  currentCustomization,
  activePresetId,
  onSelectPreset,
}) => {
  const activePreset = QR_PRESETS.find((p) => p.id === activePresetId);
  const isModified =
    activePreset &&
    (activePreset.fgColor.toLowerCase() !== currentCustomization.fgColor.toLowerCase() ||
      activePreset.bgColor.toLowerCase() !== currentCustomization.bgColor.toLowerCase() ||
      activePreset.errorCorrectionLevel !== currentCustomization.errorCorrectionLevel ||
      activePreset.margin !== currentCustomization.margin);

  return (
    <div className="tool-section">
      <div className="tool-section-header">
        <span className="tool-section-title">Color Presets</span>
        {isModified ? (
          <span className="stamp-pill stamp-pill-warn">Customized</span>
        ) : activePresetId ? (
          <span className="stamp-pill stamp-pill-ink">Locked</span>
        ) : null}
      </div>

      <div className="preset-stamp-row">
        {QR_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-stamp-btn ${isSelected ? 'stamp-selected' : ''}`}
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
            >
              <div
                className="stamp-icon-box"
                style={{ backgroundColor: preset.bgColor }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill={preset.fgColor}
                  className="mini-matrix"
                  aria-hidden="true"
                >
                  <path d="M1 1h5v5H1V1zm1 1v3h3V2H2zm1 1h1v1H3V3z" />
                  <path d="M10 1h5v5h-5V1zm1 1v3h3V2h-3zm1 1h1v1h-1V3z" />
                  <path d="M1 10h5v5H1v-5zm1 1v3h3v-3H2zm1 1h1v1H3v-1z" />
                  <rect x="8" y="8" width="2" height="2" />
                  <rect x="12" y="10" width="2" height="2" />
                  <rect x="10" y="13" width="2" height="2" />
                </svg>
              </div>
              <span className="stamp-name">{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
