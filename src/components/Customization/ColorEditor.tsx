import React from 'react';
import { RefreshIcon } from '../common/Icons';

interface ColorEditorProps {
  fgColor: string;
  bgColor: string;
  onChangeFg: (color: string) => void;
  onChangeBg: (color: string) => void;
  onSwapColors: () => void;
}

const COMMON_FG_SWATCHES = ['#0f172a', '#1e293b', '#0b2545', '#1c1917', '#064e3b', '#451a03'];
const COMMON_BG_SWATCHES = ['#ffffff', '#faf8f5', '#f8fafc', '#f4f4f5', '#f0fdf4', '#fefce8'];

export const ColorEditor: React.FC<ColorEditorProps> = ({
  fgColor,
  bgColor,
  onChangeFg,
  onChangeBg,
  onSwapColors,
}) => {
  return (
    <div className="customization-section">
      <div className="section-label-row">
        <label className="section-heading-label">Color Palette</label>
        <button
          type="button"
          className="btn-text-swap"
          onClick={onSwapColors}
          title="Swap foreground and background colors"
        >
          <RefreshIcon size={12} />
          <span>Swap Colors</span>
        </button>
      </div>

      <div className="color-editor-grid">
        <div className="color-control-block">
          <label htmlFor="fg-color-hex" className="color-block-label">
            Foreground (Modules)
          </label>
          <div className="color-input-combo">
            <label className="color-swatch-box" style={{ backgroundColor: fgColor }}>
              <input
                type="color"
                className="native-color-picker"
                value={fgColor}
                onChange={(e) => onChangeFg(e.target.value)}
                aria-label="Foreground color picker"
              />
            </label>
            <input
              id="fg-color-hex"
              type="text"
              className="color-hex-input"
              value={fgColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || /^[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChangeFg(val.startsWith('#') ? val : `#${val}`);
                }
              }}
              maxLength={7}
              spellCheck={false}
            />
          </div>
          <div className="swatches-quick-list" aria-label="Foreground color swatches">
            {COMMON_FG_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`quick-swatch-dot ${fgColor.toLowerCase() === hex.toLowerCase() ? 'swatch-active' : ''}`}
                style={{ backgroundColor: hex }}
                onClick={() => onChangeFg(hex)}
                title={`Set foreground to ${hex}`}
              />
            ))}
          </div>
        </div>

        <div className="color-control-block">
          <label htmlFor="bg-color-hex" className="color-block-label">
            Background (Canvas)
          </label>
          <div className="color-input-combo">
            <label className="color-swatch-box" style={{ backgroundColor: bgColor }}>
              <input
                type="color"
                className="native-color-picker"
                value={bgColor}
                onChange={(e) => onChangeBg(e.target.value)}
                aria-label="Background color picker"
              />
            </label>
            <input
              id="bg-color-hex"
              type="text"
              className="color-hex-input"
              value={bgColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || /^[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChangeBg(val.startsWith('#') ? val : `#${val}`);
                }
              }}
              maxLength={7}
              spellCheck={false}
            />
          </div>
          <div className="swatches-quick-list" aria-label="Background color swatches">
            {COMMON_BG_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`quick-swatch-dot ${bgColor.toLowerCase() === hex.toLowerCase() ? 'swatch-active' : ''}`}
                style={{ backgroundColor: hex }}
                onClick={() => onChangeBg(hex)}
                title={`Set background to ${hex}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
