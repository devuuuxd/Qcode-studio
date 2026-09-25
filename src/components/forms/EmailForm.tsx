import React from 'react';
import type { EmailFormData } from '../../types/qr';

interface EmailFormProps {
  data: EmailFormData;
  errors: Record<string, string>;
  onChange: (updates: Partial<EmailFormData>) => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({ data, errors, onChange }) => {
  return (
    <div className="form-group-stack">
      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="email-address-input" className="input-label">
            Recipient Email <span className="label-required">*</span>
          </label>
        </div>
        <div className={`input-control-box ${errors.email ? 'has-error' : ''}`}>
          <input
            id="email-address-input"
            type="email"
            className="text-input"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="contact@company.com"
            autoComplete="email"
          />
        </div>
        {errors.email && <p className="field-error-msg">{errors.email}</p>}
      </div>

      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="email-subject-input" className="input-label">
            Subject Line <span className="label-optional">(Optional)</span>
          </label>
        </div>
        <div className={`input-control-box ${errors.subject ? 'has-error' : ''}`}>
          <input
            id="email-subject-input"
            type="text"
            className="text-input"
            value={data.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder="Inquiry regarding design services"
          />
        </div>
        {errors.subject && <p className="field-error-msg">{errors.subject}</p>}
      </div>

      <div className="input-field-wrapper">
        <div className="input-label-row">
          <label htmlFor="email-message-input" className="input-label">
            Default Message Body <span className="label-optional">(Optional)</span>
          </label>
        </div>
        <div className="input-control-box">
          <textarea
            id="email-message-input"
            rows={3}
            className="textarea-input"
            value={data.message}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder="Pre-populate the body of the email message for the sender..."
          />
        </div>
      </div>
    </div>
  );
};
