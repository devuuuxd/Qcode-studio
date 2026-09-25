import React from 'react';
import type { TextFormData } from '../../types/qr';

interface TextFormProps {
  data: TextFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<TextFormData>) => void;
}

export const TextForm: React.FC<TextFormProps> = ({ data, errors, onChange }) => {
  const charCount = data.text.length;

  return (
    <div className="form-group-stack">
      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="text-input" className="input-label">
            Plain Text Content <span className="label-required">*</span>
          </label>
          <span className={`char-counter ${charCount > 500 ? 'counter-dense' : ''}`}>
            {charCount} characters {charCount > 300 && '(Higher density)'}
          </span>
        </div>
        <div className={`input-control-box ${errors.text ? 'has-error' : ''}`}>
          <textarea
            id="text-input"
            rows={5}
            className="textarea-input"
            value={data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type or paste any plain text, serial number, notes, or instructions..."
          />
        </div>
        {errors.text && <p className="field-error-msg">{errors.text}</p>}
      </div>
    </div>
  );
};
