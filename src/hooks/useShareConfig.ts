import { useCallback } from 'react';
import type { QRType, AnyFormData, QRCustomization } from '../types/qr';
import { encodeShareableConfig, decodeShareableConfig } from '../utils/storage';

export interface UseShareConfigReturn {
  getShareableUrl: (
    type: QRType,
    formData: AnyFormData,
    customization: QRCustomization
  ) => string;
  checkInitialShareConfig: () => {
    type: QRType;
    formData: AnyFormData;
    customization: QRCustomization;
  } | null;
}

export function useShareConfig(): UseShareConfigReturn {
  const getShareableUrl = useCallback(
    (type: QRType, formData: AnyFormData, customization: QRCustomization) => {
      const hash = encodeShareableConfig(type, formData, customization);
      if (typeof window === 'undefined') return '';
      return `${window.location.origin}${window.location.pathname}#config=${hash}`;
    },
    []
  );

  const checkInitialShareConfig = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash || !hash.includes('config=')) return null;

    const result = decodeShareableConfig(hash);
    if (result.valid && result.data) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return result.data;
    }
    return null;
  }, []);

  return {
    getShareableUrl,
    checkInitialShareConfig,
  };
}
