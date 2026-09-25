import { useState, useMemo, useCallback } from 'react';
import type { QRType, FormDataMap, AnyFormData, ValidationResult } from '../types/qr';
import { buildQrPayload, getPayloadSummary } from '../utils/qrPayload';
import { validateQrForm } from '../utils/validation';

export const INITIAL_FORM_DATA: FormDataMap = {
  url: { url: 'https://github.com' },
  text: { text: '' },
  email: { email: '', subject: '', message: '' },
  phone: { phone: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
};

export interface UseQrEditorReturn {
  selectedType: QRType;
  formData: FormDataMap;
  currentFormData: AnyFormData;
  payload: string;
  validation: ValidationResult;
  summary: string;
  setSelectedType: (type: QRType) => void;
  updateForm: <T extends QRType>(type: T, updates: Partial<FormDataMap[T]>) => void;
  setAllFormData: (type: QRType, data: AnyFormData) => void;
  resetEditor: () => void;
}

export function useQrEditor(): UseQrEditorReturn {
  const [selectedType, setSelectedType] = useState<QRType>('url');
  const [formData, setFormData] = useState<FormDataMap>(INITIAL_FORM_DATA);

  const updateForm = useCallback(
    <T extends QRType>(type: T, updates: Partial<FormDataMap[T]>) => {
      setFormData((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          ...updates,
        },
      }));
    },
    []
  );

  const setAllFormData = useCallback((type: QRType, data: AnyFormData) => {
    setSelectedType(type);
    setFormData((prev) => ({
      ...prev,
      [type]: data,
    }));
  }, []);

  const resetEditor = useCallback(() => {
    setSelectedType('url');
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const currentFormData = formData[selectedType];

  const payload = useMemo(
    () => buildQrPayload(selectedType, currentFormData),
    [selectedType, currentFormData]
  );

  const validation = useMemo(
    () => validateQrForm(selectedType, currentFormData),
    [selectedType, currentFormData]
  );

  const summary = useMemo(
    () => getPayloadSummary(selectedType, currentFormData),
    [selectedType, currentFormData]
  );

  return {
    selectedType,
    formData,
    currentFormData,
    payload,
    validation,
    summary,
    setSelectedType,
    updateForm,
    setAllFormData,
    resetEditor,
  };
}
