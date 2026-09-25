import React, { useState } from 'react';
import type { QRCustomization, QRType, ScanSafetyReport } from '../../types/qr';
import { downloadPng, downloadSvg, copyQrToClipboard } from '../../utils/export';
import { DownloadIcon, CopyIcon, PrinterIcon } from '../common/Icons';

interface ExportActionsProps {
  payload: string;
  type: QRType;
  customization: QRCustomization;
  isValid: boolean;
  scanSafety: ScanSafetyReport;
  onShowToast: (type: 'success' | 'warning' | 'info', message: string) => void;
  onTrackExport?: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  payload,
  type,
  customization,
  isValid,
  scanSafety,
  onShowToast,
  onTrackExport,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [pngResolution, setPngResolution] = useState<number>(1024);

  const isCritical = scanSafety.status === 'critical';
  const isDisabled = !isValid || !payload.trim() || isExporting;

  const handleDownloadPng = async () => {
    if (isDisabled) return;
    setIsExporting(true);

    try {
      const filename = `qr-${type}-${pngResolution}px.png`;
      await downloadPng(payload, customization, {
        exportSize: pngResolution,
        filename,
      });
      onShowToast('success', `Downloaded PNG (${pngResolution}px)`);
      if (onTrackExport) onTrackExport();
    } catch {
      onShowToast('warning', 'Failed to generate PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = async () => {
    if (isDisabled) return;
    setIsExporting(true);

    try {
      const filename = `qr-${type}-vector.svg`;
      await downloadSvg(payload, customization, filename);
      onShowToast('success', 'Vector SVG downloaded.');
      if (onTrackExport) onTrackExport();
    } catch {
      onShowToast('warning', 'Failed to export SVG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (isDisabled) return;
    setIsExporting(true);

    try {
      await copyQrToClipboard(payload, customization);
      onShowToast('success', 'PNG copied to clipboard.');
    } catch {
      onShowToast('info', 'Clipboard image copy not supported in this browser.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (isDisabled) return;
    window.print();
  };

  return (
    <div className="export-cluster">
      {isCritical && isValid && (
        <div className="critical-warning-box" role="alert">
          <span>⚠️ Low contrast ({scanSafety.contrastRatio}:1) may cause scan failure.</span>
        </div>
      )}

      <div className="export-main-row">
        <button
          type="button"
          className="btn-export-primary"
          onClick={handleDownloadPng}
          disabled={isDisabled}
        >
          <DownloadIcon size={16} />
          <span>{isExporting ? 'EXPORTING...' : 'DOWNLOAD PNG'}</span>
        </button>

        <select
          id="png-res-select"
          className="tactile-select-res"
          value={pngResolution}
          onChange={(e) => setPngResolution(Number(e.target.value))}
          disabled={isDisabled}
          title="Export resolution"
        >
          <option value={512}>512px</option>
          <option value={1024}>1024px</option>
          <option value={2048}>2048px</option>
        </select>
      </div>

      <div className="export-secondary-row">
        <button
          type="button"
          className="btn-export-secondary"
          onClick={handleDownloadSvg}
          disabled={isDisabled}
          title="Download vector SVG"
        >
          <DownloadIcon size={14} />
          <span>SVG Vector</span>
        </button>

        <button
          type="button"
          className="btn-export-secondary"
          onClick={handleCopyClipboard}
          disabled={isDisabled}
          title="Copy PNG to clipboard"
        >
          <CopyIcon size={14} />
          <span>Copy Image</span>
        </button>

        <button
          type="button"
          className="btn-export-secondary btn-export-print"
          onClick={handlePrint}
          disabled={isDisabled}
          title="Print QR code"
        >
          <PrinterIcon size={14} />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};
