import React, { useState } from 'react';
import type { QRTemplate, QRCustomization } from '../../types/qr';
import { BookmarkIcon, TrashIcon, CheckIcon } from '../common/Icons';

interface TemplateManagerProps {
  templates: QRTemplate[];
  currentCustomization: QRCustomization;
  onSaveTemplate: (name: string, customization: QRCustomization) => void;
  onApplyTemplate: (template: QRTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  currentCustomization,
  onSaveTemplate,
  onApplyTemplate,
  onDeleteTemplate,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = templateName.trim();
    if (!trimmed) return;

    onSaveTemplate(trimmed, currentCustomization);
    setTemplateName('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="tool-section">
      <div className="tool-section-header">
        <span className="tool-section-title">Saved Templates</span>
        <span className="tool-meta-tag">{templates.length} saved</span>
      </div>

      <form className="template-save-form" onSubmit={handleSave}>
        <div className="template-input-row">
          <input
            type="text"
            className="text-input template-name-field"
            placeholder="Style name (e.g., Bold Dark Navy)"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            maxLength={32}
          />
          <button
            type="submit"
            className="btn-tactile btn-save-template"
            disabled={!templateName.trim()}
          >
            {isSaved ? (
              <>
                <CheckIcon size={12} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <BookmarkIcon size={12} />
                <span>Save Style</span>
              </>
            )}
          </button>
        </div>
      </form>

      {templates.length > 0 && (
        <div className="templates-list-grid">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="template-card">
              <button
                type="button"
                className="template-card-main"
                onClick={() => onApplyTemplate(tmpl)}
                title={`Apply template: ${tmpl.name}`}
              >
                <span
                  className="template-swatch"
                  style={{
                    backgroundColor: tmpl.customization.bgColor,
                    borderColor: 'var(--ink)',
                  }}
                >
                  <span
                    className="template-swatch-core"
                    style={{ backgroundColor: tmpl.customization.fgColor }}
                  />
                </span>
                <span className="template-name">{tmpl.name}</span>
                <span className="template-badge">{tmpl.customization.moduleStyle}</span>
              </button>

              <button
                type="button"
                className="btn-template-del"
                onClick={() => onDeleteTemplate(tmpl.id)}
                title="Delete template"
                aria-label={`Delete template ${tmpl.name}`}
              >
                <TrashIcon size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
