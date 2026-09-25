import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type {
  QRType,
  FormDataMap,
  QRCustomization,
  QRPreset,
  HistoryItem,
  ScanSafetyIssue,
} from './types/qr';
import { buildQrPayload, getPayloadSummary } from './utils/qrPayload';
import { validateQrForm } from './utils/validation';
import { evaluateScanSafety } from './utils/scanSafety';
import { DEFAULT_CUSTOMIZATION } from './utils/presets';
import {
  loadHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/storage';

import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { UrlForm } from './components/forms/UrlForm';
import { TextForm } from './components/forms/TextForm';
import { EmailForm } from './components/forms/EmailForm';
import { PhoneForm } from './components/forms/PhoneForm';
import { WifiForm } from './components/forms/WifiForm';

import { PresetsBar } from './components/Customization/PresetsBar';
import { ColorEditor } from './components/Customization/ColorEditor';
import { LayoutEditor } from './components/Customization/LayoutEditor';
import { ErrorCorrectionEditor } from './components/Customization/ErrorCorrectionEditor';

import { QrCanvas } from './components/Preview/QrCanvas';
import { ScanSafetyPanel } from './components/Preview/ScanSafetyPanel';
import { ExportActions } from './components/Preview/ExportActions';
import { PayloadInspector } from './components/Preview/PayloadInspector';
import { RecentList } from './components/History/RecentList';
import { Toast, type ToastMessage } from './components/common/Toast';

import './App.css';

const INITIAL_FORM_DATA: FormDataMap = {
  url: { url: 'https://github.com' },
  text: { text: '' },
  email: { email: '', subject: '', message: '' },
  phone: { phone: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
};

export const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<QRType>('url');
  const [formData, setFormData] = useState<FormDataMap>(INITIAL_FORM_DATA);
  const [customization, setCustomization] = useState<QRCustomization>(DEFAULT_CUSTOMIZATION);
  const [activePresetId, setActivePresetId] = useState<string | null>('classic');
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const saveDebounceTimer = useRef<number | null>(null);

  const showToast = useCallback((type: 'success' | 'warning' | 'info', message: string) => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    });
  }, []);

  const handleUpdateForm = useCallback(
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

  const currentFormData = formData[selectedType];
  const payload = useMemo(
    () => buildQrPayload(selectedType, currentFormData),
    [selectedType, currentFormData]
  );

  const validation = useMemo(
    () => validateQrForm(selectedType, currentFormData),
    [selectedType, currentFormData]
  );

  const scanSafety = useMemo(
    () => evaluateScanSafety(customization, payload.length),
    [customization, payload.length]
  );

  useEffect(() => {
    if (!validation.isValid || !payload.trim()) return;

    if (saveDebounceTimer.current) {
      window.clearTimeout(saveDebounceTimer.current);
    }

    saveDebounceTimer.current = window.setTimeout(() => {
      const summary = getPayloadSummary(selectedType, currentFormData);
      const updated = saveHistoryItem(
        selectedType,
        summary,
        payload,
        currentFormData,
        customization,
        activePresetId || undefined
      );
      setHistory(updated);
    }, 1800);

    return () => {
      if (saveDebounceTimer.current) {
        window.clearTimeout(saveDebounceTimer.current);
      }
    };
  }, [payload, validation.isValid, selectedType, currentFormData, customization, activePresetId]);

  const handleSelectPreset = (preset: QRPreset) => {
    setActivePresetId(preset.id);
    setCustomization((prev) => ({
      ...prev,
      fgColor: preset.fgColor,
      bgColor: preset.bgColor,
      errorCorrectionLevel: preset.errorCorrectionLevel,
      margin: preset.margin,
    }));
  };

  const handleUpdateFg = (color: string) => {
    setCustomization((prev) => ({ ...prev, fgColor: color }));
  };

  const handleUpdateBg = (color: string) => {
    setCustomization((prev) => ({ ...prev, bgColor: color }));
  };

  const handleSwapColors = () => {
    setCustomization((prev) => ({
      ...prev,
      fgColor: prev.bgColor,
      bgColor: prev.fgColor,
    }));
  };

  const handleUpdateSize = (size: number) => {
    setCustomization((prev) => ({ ...prev, size }));
  };

  const handleUpdateMargin = (margin: number) => {
    setCustomization((prev) => ({ ...prev, margin }));
  };

  const handleUpdateEcl = (level: QRCustomization['errorCorrectionLevel']) => {
    setCustomization((prev) => ({ ...prev, errorCorrectionLevel: level }));
  };

  const handleFixSafetyIssue = (action?: ScanSafetyIssue['suggestedAction']) => {
    if (!action) return;

    switch (action) {
      case 'reset-contrast':
        setCustomization((prev) => ({
          ...prev,
          fgColor: '#1E1B24',
          bgColor: '#FFFFFF',
        }));
        showToast('info', 'High ink contrast applied.');
        break;

      case 'increase-margin':
        setCustomization((prev) => ({
          ...prev,
          margin: 4,
        }));
        showToast('info', 'Standard 4-module quiet zone restored.');
        break;

      case 'invert-colors':
        handleSwapColors();
        showToast('info', 'Inverted to standard dark-on-light.');
        break;

      case 'lower-ecl':
        setCustomization((prev) => ({
          ...prev,
          errorCorrectionLevel: 'M',
        }));
        showToast('info', 'Error Correction set to Medium (15%).');
        break;
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setSelectedType(item.type);
    setFormData((prev) => ({
      ...prev,
      [item.type]: item.formData,
    }));
    setCustomization(item.customization);
    setActivePresetId(item.presetId || null);
    setActiveHistoryId(item.id);
    showToast('info', `Restored ${item.type.toUpperCase()}: ${item.title}`);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
    if (activeHistoryId === id) {
      setActiveHistoryId(undefined);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all saved QR configurations?')) {
      clearAllHistory();
      setHistory([]);
      setActiveHistoryId(undefined);
      showToast('info', 'History cleared.');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all values to initial defaults?')) {
      setSelectedType('url');
      setFormData(INITIAL_FORM_DATA);
      setCustomization(DEFAULT_CUSTOMIZATION);
      setActivePresetId('classic');
      setActiveHistoryId(undefined);
      showToast('info', 'Editor reset to initial defaults.');
    }
  };

  return (
    <div className="app-shell">
      <Header onReset={handleResetAll} />

      <main className="workbench-container">
        <div className="workbench">
          <div className="workbench-editor">
            <div className="editor-type-row">
              <TypeSelector
                selectedType={selectedType}
                onSelectType={(t) => {
                  setSelectedType(t);
                  setActiveHistoryId(undefined);
                }}
              />
            </div>

            <div className="editor-form-region" id={`panel-${selectedType}`}>
              {selectedType === 'url' && (
                <UrlForm
                  data={formData.url}
                  errors={validation.errors}
                  onChange={(up) => handleUpdateForm('url', up)}
                />
              )}
              {selectedType === 'text' && (
                <TextForm
                  data={formData.text}
                  errors={validation.errors}
                  onChange={(up) => handleUpdateForm('text', up)}
                />
              )}
              {selectedType === 'email' && (
                <EmailForm
                  data={formData.email}
                  errors={validation.errors}
                  onChange={(up) => handleUpdateForm('email', up)}
                />
              )}
              {selectedType === 'phone' && (
                <PhoneForm
                  data={formData.phone}
                  errors={validation.errors}
                  onChange={(up) => handleUpdateForm('phone', up)}
                />
              )}
              {selectedType === 'wifi' && (
                <WifiForm
                  data={formData.wifi}
                  errors={validation.errors}
                  onChange={(up) => handleUpdateForm('wifi', up)}
                />
              )}
            </div>

            <div className="editor-customization-region">
              <PresetsBar
                currentCustomization={customization}
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
              />

              <ColorEditor
                fgColor={customization.fgColor}
                bgColor={customization.bgColor}
                onChangeFg={handleUpdateFg}
                onChangeBg={handleUpdateBg}
                onSwapColors={handleSwapColors}
              />

              <ErrorCorrectionEditor
                level={customization.errorCorrectionLevel}
                onChange={handleUpdateEcl}
              />

              <LayoutEditor
                size={customization.size}
                margin={customization.margin}
                onChangeSize={handleUpdateSize}
                onChangeMargin={handleUpdateMargin}
              />
            </div>
          </div>

          <div className="workbench-stage">
            <div className="stage-sticky">
              <div className="qr-physical-card">
                <div className="qr-card-header">
                  <span className="qr-badge-type">{selectedType.toUpperCase()}</span>
                  <span className="qr-badge-spec">{customization.size}px · {customization.errorCorrectionLevel}</span>
                </div>

                <QrCanvas
                  payload={payload}
                  customization={customization}
                  isValid={validation.isValid}
                />

                <ScanSafetyPanel
                  report={scanSafety}
                  onFixAction={handleFixSafetyIssue}
                />

                <ExportActions
                  payload={payload}
                  type={selectedType}
                  customization={customization}
                  isValid={validation.isValid}
                  scanSafety={scanSafety}
                  onShowToast={showToast}
                />

                <PayloadInspector payload={payload} />
              </div>
            </div>
          </div>
        </div>

        <section className="workbench-history">
          <RecentList
            items={history}
            activeId={activeHistoryId}
            onRestoreItem={handleRestoreHistory}
            onDeleteItem={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
          />
        </section>
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
