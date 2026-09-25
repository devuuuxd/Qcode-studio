import React, { useState } from 'react';
import type { WifiFormData, WifiSecurity } from '../../types/qr';
import { EyeIcon, EyeOffIcon } from '../common/Icons';

interface WifiFormProps {
  data: WifiFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<WifiFormData>) => void;
}

const SECURITY_OPTIONS: { value: WifiSecurity; label: string; desc: string }[] = [
  { value: 'WPA', label: 'WPA / WPA2 / WPA3', desc: 'Standard secure home & office' },
  { value: 'WEP', label: 'WEP', desc: 'Legacy standard' },
  { value: 'nopass', label: 'None (Open)', desc: 'No password required' },
];

export const WifiForm: React.FC<WifiFormProps> = ({ data, errors, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group-stack">
      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="wifi-ssid-input" className="input-label">
            Network Name (SSID) <span className="label-required">*</span>
          </label>
        </div>
        <div className={`input-control-box ${errors.ssid ? 'has-error' : ''}`}>
          <input
            id="wifi-ssid-input"
            type="text"
            className="text-input"
            value={data.ssid}
            onChange={(e) => onChange({ ssid: e.target.value })}
            placeholder="e.g., Office_Guest_5G"
            spellCheck={false}
          />
        </div>
        {errors.ssid && <p className="field-error-msg">{errors.ssid}</p>}
      </div>

      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label className="input-label">Security Protocol</label>
        </div>
        <div className="security-segmented-control" role="radiogroup" aria-label="Security Type">
          {SECURITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={data.security === opt.value}
              className={`segmented-opt-btn ${data.security === opt.value ? 'segmented-opt-active' : ''}`}
              onClick={() => onChange({ security: opt.value })}
            >
              <span className="opt-title">{opt.label}</span>
              <span className="opt-sub">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {data.security !== 'nopass' ? (
        <div className="input-field-wrapper">
          <div className="input-label-row">
            <label htmlFor="wifi-password-input" className="input-label">
              Network Password <span className="label-required">*</span>
            </label>
            <span className="input-hint">Min 8 characters</span>
          </div>
          <div className={`input-control-box has-addon ${errors.password ? 'has-error' : ''}`}>
            <input
              id="wifi-password-input"
              type={showPassword ? 'text' : 'password'}
              className="text-input"
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="Enter wireless security key"
              spellCheck={false}
            />
            <button
              type="button"
              className="input-addon-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {errors.password && <p className="field-error-msg">{errors.password}</p>}
        </div>
      ) : (
        <div className="info-banner-light">
          <p>This network is configured as open. Connected devices will join without credentials.</p>
        </div>
      )}

      <div className="checkbox-field-wrapper">
        <label className="custom-checkbox-label">
          <input
            type="checkbox"
            checked={data.hidden}
            onChange={(e) => onChange({ hidden: e.target.checked })}
          />
          <span className="checkbox-text">
            <strong>Hidden Network</strong> (SSID broadcast is disabled on router)
          </span>
        </label>
      </div>
    </div>
  );
};
