import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type {
  QRType,
  AnyFormData,
  QRCustomization,
  HistoryItem,
  ScanSafetyIssue,
  QRTemplate,
} from './types/qr';
import { evaluateScanSafety } from './utils/scanSafety';

import { useTheme } from './hooks/useTheme';
import { useQrEditor } from './hooks/useQrEditor';
import { useQrCustomization } from './hooks/useQrCustomization';
import { useQrHistory } from './hooks/useQrHistory';
import { useQrTemplates } from './hooks/useQrTemplates';
import { useShareConfig } from './hooks/useShareConfig';

import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { UrlForm } from './components/forms/UrlForm';
import { TextForm } from './components/forms/TextForm';
import { EmailForm } from './components/forms/EmailForm';
import { PhoneForm } from './components/forms/PhoneForm';
import { WifiForm } from './components/forms/WifiForm';

import { PresetsBar } from './components/Customization/PresetsBar';
import { TemplateManager } from './components/Customization/TemplateManager';
import { PatternEditor } from './components/Customization/PatternEditor';
import { ColorEditor } from './components/Customization/ColorEditor';
import { LogoEditor } from './components/Customization/LogoEditor';
import { ErrorCorrectionEditor } from './components/Customization/ErrorCorrectionEditor';
import { LayoutEditor } from './components/Customization/LayoutEditor';

import { QrCanvas } from './components/Preview/QrCanvas';
import { ScanSafetyPanel } from './components/Preview/ScanSafetyPanel';
import { ExportActions } from './components/Preview/ExportActions';
import { PayloadInspector } from './components/Preview/PayloadInspector';
import { RecentList } from './components/History/RecentList';
import { Toast, type ToastMessage } from './components/common/Toast';

import { ShareModal } from './components/Modals/ShareModal';
import { ImportExportModal } from './components/Modals/ImportExportModal';
import { BatchModal } from './components/Modals/BatchModal';

import './App.css';

export const App: React.FC = () => {
  const { theme, cycleTheme } = useTheme();

  const {
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
  } = useQrEditor();

  const {
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
  } = useQrCustomization();

  const {
    history,
    filteredHistory,
    activeHistoryId,
    searchQuery,
    setSearchQuery,
    setActiveHistoryId,
    saveItem,
    deleteItem,
    clearAll: clearAllHistoryState,
    togglePin,
    renameItem,
  } = useQrHistory();

  const { templates, saveNewTemplate, removeTemplate } = useQrTemplates();
  const { getShareableUrl, checkInitialShareConfig } = useShareConfig();

  const [opticalDecodeResult, setOpticalDecodeResult] = useState<{
    success: boolean;
    data?: string;
    error?: string;
  } | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const saveDebounceTimer = useRef<number | null>(null);

  const showToast = useCallback((type: 'success' | 'warning' | 'info', message: string) => {
    setToast({
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
    });
  }, []);

  useEffect(() => {
    const shared = checkInitialShareConfig();
    if (shared) {
      queueMicrotask(() => {
        setAllFormData(shared.type, shared.formData);
        applyCustomization(shared.customization, null);
        showToast('info', `Loaded shared ${shared.type.toUpperCase()} configuration.`);
      });
    }
  }, [checkInitialShareConfig, setAllFormData, applyCustomization, showToast]);

  const scanSafety = useMemo(
    () => evaluateScanSafety(customization, payload.length, opticalDecodeResult),
    [customization, payload.length, opticalDecodeResult]
  );

  useEffect(() => {
    if (!validation.isValid || !payload.trim()) return;

    if (saveDebounceTimer.current) {
      window.clearTimeout(saveDebounceTimer.current);
    }

    saveDebounceTimer.current = window.setTimeout(() => {
      saveItem(
        selectedType,
        customization.label.trim() || summary,
        payload,
        currentFormData,
        customization,
        activePresetId || undefined,
        customization.label.trim() || undefined
      );
    }, 1800);

    return () => {
      if (saveDebounceTimer.current) {
        window.clearTimeout(saveDebounceTimer.current);
      }
    };
  }, [
    payload,
    validation.isValid,
    selectedType,
    currentFormData,
    customization,
    activePresetId,
    summary,
    saveItem,
  ]);

  const handleFixSafetyIssue = (action?: ScanSafetyIssue['suggestedAction']) => {
    const message = applyRemedy(action);
    if (message) {
      showToast('info', message);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setAllFormData(item.type, item.formData);
    applyCustomization(item.customization, item.presetId || null);
    setActiveHistoryId(item.id);
    showToast('info', `Restored ${item.type.toUpperCase()}: ${item.customName || item.title}`);
  };

  const handleApplyTemplate = (tmpl: QRTemplate) => {
    applyCustomization(tmpl.customization, null);
    showToast('info', `Applied template: ${tmpl.name}`);
  };

  const handleApplyImportedConfig = (
    type: QRType,
    newFormData: AnyFormData,
    newCustomization: QRCustomization
  ) => {
    setAllFormData(type, newFormData);
    applyCustomization(newCustomization, null);
    setActiveHistoryId(undefined);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all saved QR configurations?')) {
      clearAllHistoryState();
      showToast('info', 'History cleared.');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all values to initial defaults?')) {
      resetEditor();
      resetCustomization();
      setActiveHistoryId(undefined);
      showToast('info', 'Editor reset to initial defaults.');
    }
  };

  const shareUrl = useMemo(
    () => getShareableUrl(selectedType, currentFormData, customization),
    [getShareableUrl, selectedType, currentFormData, customization]
  );

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onCycleTheme={cycleTheme}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenImportExport={() => setIsImportExportModalOpen(true)}
        onOpenBatch={() => setIsBatchModalOpen(true)}
        onReset={handleResetAll}
      />

      <div className="print-document-zone" aria-hidden="true">
        <div className="print-content">
          <QrCanvas
            payload={payload}
            customization={customization}
            isValid={validation.isValid}
          />
          {customization.label ? (
            <h2 className="print-label-heading">{customization.label}</h2>
          ) : (
            <p className="print-summary-text">{summary}</p>
          )}
          <span className="print-specs-meta">
            {customization.size}px · {customization.errorCorrectionLevel} ECL · {customization.moduleStyle}
          </span>
        </div>
      </div>

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

            <div className="input-field-wrapper label-input-wrapper">
              <div className="input-label-row">
                <label htmlFor="qr-label-input" className="input-label">
                  Label / Name
                </label>
                <span className="label-optional">Optional</span>
              </div>
              <div className="input-control-box">
                <input
                  id="qr-label-input"
                  type="text"
                  className="text-input"
                  placeholder="e.g., Office Wi-Fi, Portfolio, Menu"
                  value={customization.label}
                  onChange={(e) => updateLabel(e.target.value)}
                  maxLength={48}
                />
              </div>
            </div>

            <div className="editor-form-region" id={`panel-${selectedType}`}>
              {selectedType === 'url' && (
                <UrlForm
                  data={formData.url}
                  errors={validation.errors}
                  onChange={(up) => updateForm('url', up)}
                />
              )}
              {selectedType === 'text' && (
                <TextForm
                  data={formData.text}
                  errors={validation.errors}
                  onChange={(up) => updateForm('text', up)}
                />
              )}
              {selectedType === 'email' && (
                <EmailForm
                  data={formData.email}
                  errors={validation.errors}
                  onChange={(up) => updateForm('email', up)}
                />
              )}
              {selectedType === 'phone' && (
                <PhoneForm
                  data={formData.phone}
                  errors={validation.errors}
                  onChange={(up) => updateForm('phone', up)}
                />
              )}
              {selectedType === 'wifi' && (
                <WifiForm
                  data={formData.wifi}
                  errors={validation.errors}
                  onChange={(up) => updateForm('wifi', up)}
                />
              )}
            </div>

            <div className="editor-customization-region">
              <PresetsBar
                currentCustomization={customization}
                activePresetId={activePresetId}
                onSelectPreset={selectPreset}
              />

              <TemplateManager
                templates={templates}
                currentCustomization={customization}
                onSaveTemplate={saveNewTemplate}
                onApplyTemplate={handleApplyTemplate}
                onDeleteTemplate={removeTemplate}
              />

              <PatternEditor
                moduleStyle={customization.moduleStyle}
                onChange={updateModuleStyle}
              />

              <ColorEditor
                fgColor={customization.fgColor}
                bgColor={customization.bgColor}
                gradientEnabled={customization.gradientEnabled}
                gradientColor={customization.gradientColor}
                gradientDirection={customization.gradientDirection}
                onChangeFg={updateFg}
                onChangeBg={updateBg}
                onSwapColors={swapColors}
                onToggleGradient={toggleGradient}
                onChangeGradientColor={updateGradientColor}
                onChangeGradientDirection={updateGradientDirection}
              />

              <LogoEditor
                logoDataUrl={customization.logoDataUrl}
                logoSize={customization.logoSize}
                errorCorrectionLevel={customization.errorCorrectionLevel}
                onUpdateLogo={updateLogo}
                onUpdateLogoSize={updateLogoSize}
                onRemoveLogo={removeLogo}
              />

              <ErrorCorrectionEditor
                level={customization.errorCorrectionLevel}
                onChange={updateEcl}
              />

              <LayoutEditor
                size={customization.size}
                margin={customization.margin}
                onChangeSize={updateSize}
                onChangeMargin={updateMargin}
              />
            </div>
          </div>

          <div className="workbench-stage">
            <div className="stage-sticky">
              <div className="qr-physical-card">
                <div className="qr-card-header">
                  <div className="qr-header-title-box">
                    <span className="qr-badge-type">{selectedType.toUpperCase()}</span>
                    {customization.label && (
                      <span className="qr-badge-label">{customization.label}</span>
                    )}
                  </div>
                  <span className="qr-badge-spec">
                    {customization.size}px · {customization.errorCorrectionLevel} · {customization.moduleStyle}
                  </span>
                </div>

                <QrCanvas
                  payload={payload}
                  customization={customization}
                  isValid={validation.isValid}
                  onOpticalDecodeResult={setOpticalDecodeResult}
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

                <PayloadInspector
                  payload={payload}
                  type={selectedType}
                  customization={customization}
                />
              </div>
            </div>
          </div>
        </div>

        <section className="workbench-history">
          <RecentList
            items={history}
            filteredItems={filteredHistory}
            activeId={activeHistoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRestoreItem={handleRestoreHistory}
            onDeleteItem={deleteItem}
            onClearAll={handleClearAllHistory}
            onTogglePin={togglePin}
            onRenameItem={renameItem}
          />
        </section>
      </main>

      <ShareModal
        shareUrl={shareUrl}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={showToast}
      />

      <ImportExportModal
        currentType={selectedType}
        currentFormData={currentFormData}
        currentCustomization={customization}
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onApplyConfig={handleApplyImportedConfig}
        onShowToast={showToast}
      />

      <BatchModal
        customization={customization}
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onShowToast={showToast}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
