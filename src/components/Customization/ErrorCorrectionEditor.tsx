import React from 'react';
import type { ErrorCorrectionLevel } from '../../types/qr';

interface ErrorCorrectionEditorProps {
  level: ErrorCorrectionLevel;
  onChange: (level: ErrorCorrectionLevel) => void;
}

interface ECLOption {
  value: ErrorCorrectionLevel;
  label: string;
  recovery: string;
  shortDesc: string;
}

const ECL_OPTIONS: ECLOption[] = [
  { value: 'L', label: 'Low', recovery: '7%', shortDesc: 'Fastest scan at small sizes' },
  { value: 'M', label: 'Medium', recovery: '15%', shortDesc: 'Standard balanced default' },
  { value: 'Q', label: 'Quartile', recovery: '25%', shortDesc: 'Resists partial occlusion' },
  { value: 'H', label: 'High', recovery: '30%', shortDesc: 'Survives heavy physical wear' },
];

export const ErrorCorrectionEditor: React.FC<ErrorCorrectionEditorProps> = ({
  level,
  onChange,
}) => {
  const activeOpt = ECL_OPTIONS.find((o) => o.value === level) || ECL_OPTIONS[1];

  return (
    <div className="tool-section">
      <div className="tool-section-header">
        <span className="tool-section-title">Error Correction</span>
        <span className="tool-meta-tag">{activeOpt.recovery} recovery</span>
      </div>

      <div className="ecl-chunky-row" role="radiogroup" aria-label="Error Correction Level">
        {ECL_OPTIONS.map((opt) => {
          const isActive = level === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`ecl-chunk-btn ${isActive ? 'chunk-active' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <span className="chunk-key">{opt.value}</span>
              <span className="chunk-label">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <p className="tradeoff-mini-note">
        <strong>{activeOpt.label} ({activeOpt.recovery}):</strong> {activeOpt.shortDesc}. Higher redundancy increases grid density.
      </p>
    </div>
  );
};
