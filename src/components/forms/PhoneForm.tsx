import React from 'react';
import type { PhoneFormData } from '../../types/qr';

interface PhoneFormProps {
  data: PhoneFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<PhoneFormData>) => void;
}

export const PhoneForm: React.FC<PhoneFormProps> = ({ data, errors, onChange }) => {
  return (
    <div className="form-group-stack">
      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="phone-input" className="input-label">
            Phone Number <span className="label-required">*</span>
          </label>
          <span className="input-hint">Include country code</span>
        </div>
        <div className={`input-control-box ${errors.phone ? 'has-error' : ''}`}>
          <input
            id="phone-input"
            type="tel"
            className="text-input"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 234-5678"
            autoComplete="tel"
          />
        </div>
        {errors.phone && <p className="field-error-msg">{errors.phone}</p>}
      </div>
    </div>
  );
};
