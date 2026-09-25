import { useState, useCallback } from 'react';
import type {
  QRCustomization,
  QRPreset,
  ModuleStyle,
  GradientDirection,
  ErrorCorrectionLevel,
  ScanSafetyIssue,
} from '../types/qr';
import { DEFAULT_CUSTOMIZATION } from '../utils/presets';

export interface UseQrCustomizationReturn {
  customization: QRCustomization;
  activePresetId: string | null;
  selectPreset: (preset: QRPreset) => void;
  updateFg: (color: string) => void;
  updateBg: (color: string) => void;
  swapColors: () => void;
  updateSize: (size: number) => void;
  updateMargin: (margin: number) => void;
  updateEcl: (level: ErrorCorrectionLevel) => void;
  updateModuleStyle: (style: ModuleStyle) => void;
  toggleGradient: (enabled: boolean) => void;
  updateGradientColor: (color: string) => void;
  updateGradientDirection: (direction: GradientDirection) => void;
  updateLogo: (dataUrl: string | null) => void;
  updateLogoSize: (size: number) => void;
  removeLogo: () => void;
  updateLabel: (label: string) => void;
  applyCustomization: (newCustom: QRCustomization, presetId?: string | null) => void;
  applyRemedy: (action?: ScanSafetyIssue['suggestedAction']) => string | null;
  resetCustomization: () => void;
}

export function useQrCustomization(): UseQrCustomizationReturn {
  const [customization, setCustomization] = useState<QRCustomization>(DEFAULT_CUSTOMIZATION);
  const [activePresetId, setActivePresetId] = useState<string | null>('classic');

  const selectPreset = useCallback((preset: QRPreset) => {
    setActivePresetId(preset.id);
    setCustomization((prev) => ({
      ...prev,
      fgColor: preset.fgColor,
      bgColor: preset.bgColor,
      errorCorrectionLevel: preset.errorCorrectionLevel,
      margin: preset.margin,
      moduleStyle: preset.moduleStyle || prev.moduleStyle,
      gradientEnabled: preset.gradientEnabled ?? false,
      gradientColor: preset.gradientColor || prev.gradientColor,
      gradientDirection: preset.gradientDirection || prev.gradientDirection,
    }));
  }, []);

  const updateFg = useCallback((fgColor: string) => {
    setCustomization((prev) => ({ ...prev, fgColor }));
  }, []);

  const updateBg = useCallback((bgColor: string) => {
    setCustomization((prev) => ({ ...prev, bgColor }));
  }, []);

  const swapColors = useCallback(() => {
    setCustomization((prev) => ({
      ...prev,
      fgColor: prev.bgColor,
      bgColor: prev.fgColor,
    }));
  }, []);

  const updateSize = useCallback((size: number) => {
    setCustomization((prev) => ({ ...prev, size }));
  }, []);

  const updateMargin = useCallback((margin: number) => {
    setCustomization((prev) => ({ ...prev, margin }));
  }, []);

  const updateEcl = useCallback((errorCorrectionLevel: ErrorCorrectionLevel) => {
    setCustomization((prev) => ({ ...prev, errorCorrectionLevel }));
  }, []);

  const updateModuleStyle = useCallback((moduleStyle: ModuleStyle) => {
    setCustomization((prev) => ({ ...prev, moduleStyle }));
  }, []);

  const toggleGradient = useCallback((gradientEnabled: boolean) => {
    setCustomization((prev) => ({ ...prev, gradientEnabled }));
  }, []);

  const updateGradientColor = useCallback((gradientColor: string) => {
    setCustomization((prev) => ({ ...prev, gradientColor }));
  }, []);

  const updateGradientDirection = useCallback((gradientDirection: GradientDirection) => {
    setCustomization((prev) => ({ ...prev, gradientDirection }));
  }, []);

  const updateLogo = useCallback((logoDataUrl: string | null) => {
    setCustomization((prev) => ({
      ...prev,
      logoDataUrl,
      errorCorrectionLevel: logoDataUrl && prev.errorCorrectionLevel !== 'H' ? 'H' : prev.errorCorrectionLevel,
    }));
  }, []);

  const updateLogoSize = useCallback((logoSize: number) => {
    setCustomization((prev) => ({ ...prev, logoSize }));
  }, []);

  const removeLogo = useCallback(() => {
    setCustomization((prev) => ({ ...prev, logoDataUrl: null }));
  }, []);

  const updateLabel = useCallback((label: string) => {
    setCustomization((prev) => ({ ...prev, label }));
  }, []);

  const applyCustomization = useCallback((newCustom: QRCustomization, presetId?: string | null) => {
    setCustomization(newCustom);
    setActivePresetId(presetId !== undefined ? presetId : null);
  }, []);

  const applyRemedy = useCallback((action?: ScanSafetyIssue['suggestedAction']): string | null => {
    if (!action) return null;

    switch (action) {
      case 'reset-contrast':
        setCustomization((prev) => ({
          ...prev,
          fgColor: '#1E1B24',
          bgColor: '#FFFFFF',
          gradientEnabled: false,
        }));
        return 'High contrast monochrome restored.';

      case 'increase-margin':
        setCustomization((prev) => ({
          ...prev,
          margin: 4,
        }));
        return 'Standard 4-module quiet zone restored.';

      case 'invert-colors':
        swapColors();
        return 'Inverted to standard dark-on-light.';

      case 'lower-ecl':
        setCustomization((prev) => ({
          ...prev,
          errorCorrectionLevel: 'M',
        }));
        return 'Error Correction set to Medium (15%).';

      case 'boost-ecl':
        setCustomization((prev) => ({
          ...prev,
          errorCorrectionLevel: 'H',
        }));
        return 'Error Correction boosted to High (30%) for logo safety.';

      case 'reduce-logo':
        setCustomization((prev) => ({
          ...prev,
          logoSize: 18,
        }));
        return 'Logo size scaled down to 18%.';

      default:
        return null;
    }
  }, [swapColors]);

  const resetCustomization = useCallback(() => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    setActivePresetId('classic');
  }, []);

  return {
    customization,
    activePresetId,
    selectPreset,
    updateFg,
    updateBg,
    swapColors,
    updateSize,
    updateMargin,
    updateEcl,
    updateModuleStyle,
    toggleGradient,
    updateGradientColor,
    updateGradientDirection,
    updateLogo,
    updateLogoSize,
    removeLogo,
    updateLabel,
    applyCustomization,
    applyRemedy,
    resetCustomization,
  };
}
