import React from 'react';
import type { ModuleStyle } from '../../types/qr';

interface PatternEditorProps {
  moduleStyle: ModuleStyle;
  onChange: (style: ModuleStyle) => void;
}

interface PatternOption {
  value: ModuleStyle;
  label: string;
  desc: string;
}

const PATTERN_OPTIONS: PatternOption[] = [
  { value: 'square', label: 'Square', desc: 'Standard sharp geometry' },
  { value: 'rounded', label: 'Rounded', desc: 'Softened module corners' },
  { value: 'dots', label: 'Dots', desc: 'Modern circular matrix' },
];

export const PatternEditor: React.FC<PatternEditorProps> = ({
  moduleStyle,
  onChange,
}) => {
  return (
    <div className="tool-section">
      <div className="tool-section-header">
        <span className="tool-section-title">Pattern Style</span>
        <span className="tool-meta-tag">{moduleStyle.toUpperCase()}</span>
      </div>

      <div className="module-style-grid" role="radiogroup" aria-label="QR Module Style">
        {PATTERN_OPTIONS.map((opt) => {
          const isActive = moduleStyle === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`module-style-btn ${isActive ? 'pattern-active' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              <div className="pattern-glyph-preview" aria-hidden="true">
                {opt.value === 'square' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="9" height="9" />
                    <rect x="13" y="2" width="9" height="9" />
                    <rect x="2" y="13" width="9" height="9" />
                    <rect x="13" y="13" width="9" height="9" />
                  </svg>
                )}
                {opt.value === 'rounded' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="9" height="9" rx="2.5" />
                    <rect x="13" y="2" width="9" height="9" rx="2.5" />
                    <rect x="2" y="13" width="9" height="9" rx="2.5" />
                    <rect x="13" y="13" width="9" height="9" rx="2.5" />
                  </svg>
                )}
                {opt.value === 'dots' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="6.5" cy="6.5" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="4.5" />
                    <circle cx="6.5" cy="17.5" r="4.5" />
                    <circle cx="17.5" cy="17.5" r="4.5" />
                  </svg>
                )}
              </div>
              <span className="pattern-label">{opt.label}</span>
              <span className="pattern-desc">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
