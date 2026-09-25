import { useState, useCallback } from 'react';
import type { QRTemplate, QRCustomization } from '../types/qr';
import { loadTemplates, saveTemplate, deleteTemplate } from '../utils/storage';

export interface UseQrTemplatesReturn {
  templates: QRTemplate[];
  saveNewTemplate: (name: string, customization: QRCustomization) => void;
  removeTemplate: (id: string) => void;
}

export function useQrTemplates(): UseQrTemplatesReturn {
  const [templates, setTemplates] = useState<QRTemplate[]>(() => loadTemplates());

  const saveNewTemplate = useCallback((name: string, customization: QRCustomization) => {
    const updated = saveTemplate(name, customization);
    setTemplates(updated);
  }, []);

  const removeTemplate = useCallback((id: string) => {
    const updated = deleteTemplate(id);
    setTemplates(updated);
  }, []);

  return {
    templates,
    saveNewTemplate,
    removeTemplate,
  };
}
