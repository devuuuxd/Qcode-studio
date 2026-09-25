import React from 'react';
import type { UrlFormData } from '../../types/qr';

interface UrlFormProps {
  data: UrlFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<UrlFormData>) => void;
}

export const UrlForm: React.FC<UrlFormProps> = ({ data, errors, onChange }) => {
  return (
    <div className="form-group-stack">
      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="url-input" className="input-label">
            Target URL <span className="label-required">*</span>
          </label>
          <span className="input-hint">http:// or https://</span>
        </div>
        <div className={`input-control-box ${errors.url ? 'has-error' : ''}`}>
          <input
            id="url-input"
            type="url"
            className="text-input"
            value={data.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://example.com/dest"
            autoComplete="url"
            spellCheck={false}
          />
        </div>
        {errors.url && <p className="field-error-msg">{errors.url}</p>}
      </div>
    </div>
  );
};
