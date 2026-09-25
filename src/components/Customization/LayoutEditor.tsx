import React from 'react';
import { AlertTriangleIcon } from '../common/Icons';

interface LayoutEditorProps {
  size: number;
  margin: number;
  onChangeSize: (size: number) => void;
  onChangeMargin: (margin: number) => void;
}

const SIZE_PRESETS = [
  { label: 'Web', value: 360 },
  { label: 'HD', value: 512 },
  { label: 'Print', value: 720 },
];

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  size,
  margin,
  onChangeSize,
  onChangeMargin,
}) => {
  return (
    <div className="tool-section">
      <div className="layout-dual-grid">
        <div className="tool-subgroup">
          <div className="tool-section-header">
            <label htmlFor="qr-size-slider" className="tool-section-title">
              Dimension
            </label>
            <span className="dimension-stamp">{size}px</span>
          </div>

          <div className="slider-box">
            <input
              id="qr-size-slider"
              type="range"
              min={240}
              max={800}
              step={20}
              value={size}
              onChange={(e) => onChangeSize(Number(e.target.value))}
              className="tactile-range-slider"
            />
          </div>

          <div className="size-shortcut-row">
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`shortcut-chip ${size === p.value ? 'chip-active' : ''}`}
                onClick={() => onChangeSize(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-subgroup">
          <div className="tool-section-header">
            <label htmlFor="qr-margin-slider" className="tool-section-title">
              Quiet Zone
            </label>
            <span className="dimension-stamp">{margin} mod</span>
          </div>

          <div className="slider-box">
            <input
              id="qr-margin-slider"
              type="range"
              min={0}
              max={8}
              step={1}
              value={margin}
              onChange={(e) => onChangeMargin(Number(e.target.value))}
              className="tactile-range-slider"
            />
          </div>

          {margin < 2 ? (
            <div className="quiet-zone-alert">
              <AlertTriangleIcon size={13} />
              <span>{margin === 0 ? '0 margin: scanning fails on non-white' : 'Narrow quiet zone: min 2 recommended'}</span>
            </div>
          ) : (
            <span className="quiet-zone-ok">
              {margin === 4 ? 'ISO 4-module quiet zone' : `${margin} modules margin`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
