import React, { useState } from 'react';
import type { ScanSafetyReport, ScanSafetyIssue } from '../../types/qr';

interface ScanSafetyPanelProps {
  report: ScanSafetyReport;
  onFixAction: (actionType: ScanSafetyIssue['suggestedAction']) => void;
}

export const ScanSafetyPanel: React.FC<ScanSafetyPanelProps> = ({
  report,
  onFixAction,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const getStatusInfo = () => {
    switch (report.status) {
      case 'optimal':
        return {
          label: 'OPTIMAL',
          pillClass: 'stamp-ok',
          summary: `High optical contrast (${report.contrastRatio.toFixed(1)}:1) · Standard quiet zone`,
        };
      case 'acceptable':
        return {
          label: 'ACCEPTABLE',
          pillClass: 'stamp-neutral',
          summary: `Contrast ratio ${report.contrastRatio.toFixed(1)}:1 passes basic screen threshold`,
        };
      case 'warning':
        return {
          label: 'SCAN CAUTION',
          pillClass: 'stamp-warning',
          summary: report.issues[0]?.message || 'Sub-optimal contrast or narrow margin detected',
        };
      case 'critical':
        return {
          label: 'NEEDS ATTENTION',
          pillClass: 'stamp-critical',
          summary: report.issues[0]?.message || 'Insufficient optical contrast for camera readers',
        };
    }
  };

  const status = getStatusInfo();
  const actionableIssue = report.issues.find((i) => i.suggestedAction);

  return (
    <div className={`scan-check-card status-box-${report.status}`}>
      <div className="scan-check-top">
        <div className="scan-check-title-group">
          <span className="scan-check-heading">SCAN SAFETY</span>
          <span className={`scan-stamp-badge ${status.pillClass}`}>
            {status.label}
          </span>
          {report.decodeVerified === true && (
            <span className="scan-stamp-badge stamp-verified" title="Optically decoded by client-side reader">
              DECODE OK
            </span>
          )}
          {report.decodeVerified === false && (
            <span className="scan-stamp-badge stamp-unverified" title="Could not decode rendered image with client reader">
              UNREADABLE
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-disclosure"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          aria-expanded={showDiagnostics}
        >
          {showDiagnostics ? 'Hide Details' : 'Details'}
        </button>
      </div>

      <div className="scan-check-body">
        <p className="scan-summary-line">{status.summary}</p>

        {actionableIssue && actionableIssue.suggestedAction && (
          <button
            type="button"
            className="btn-quick-remedy"
            onClick={() => onFixAction(actionableIssue.suggestedAction)}
          >
            {actionableIssue.suggestedAction === 'reset-contrast' && '⚡ Apply High Contrast'}
            {actionableIssue.suggestedAction === 'increase-margin' && '⚡ Restore 4-Module Margin'}
            {actionableIssue.suggestedAction === 'invert-colors' && '⚡ Swap to Dark-on-Light'}
            {actionableIssue.suggestedAction === 'lower-ecl' && '⚡ Set Medium Error Correction'}
            {actionableIssue.suggestedAction === 'boost-ecl' && '⚡ Boost Error Correction to High'}
            {actionableIssue.suggestedAction === 'reduce-logo' && '⚡ Reduce Logo Area'}
          </button>
        )}
      </div>

      {showDiagnostics && (
        <div className="scan-diag-drawer">
          <div className="diag-table">
            <div className="diag-row">
              <span className="diag-term">Foreground Contrast</span>
              <span className="diag-val">{report.contrastRatio.toFixed(2)}:1</span>
            </div>
            {report.gradientContrastRatio !== undefined && (
              <div className="diag-row">
                <span className="diag-term">Gradient Accent Contrast</span>
                <span className="diag-val">{report.gradientContrastRatio.toFixed(2)}:1</span>
              </div>
            )}
            <div className="diag-row">
              <span className="diag-term">Quiet Zone</span>
              <span className="diag-val">{report.quietZoneModules} modules</span>
            </div>
            <div className="diag-row">
              <span className="diag-term">Color Polarity</span>
              <span className="diag-val">{report.isInverted ? 'Inverted (light on dark)' : 'Standard (dark on light)'}</span>
            </div>
            <div className="diag-row">
              <span className="diag-term">Client Decode Check</span>
              <span className="diag-val">
                {report.decodeVerified === true ? 'Verified (Optical read passed)' : report.decodeVerified === false ? 'Failed (Unreadable)' : 'Pending'}
              </span>
            </div>
            <div className="diag-row">
              <span className="diag-term">Readability Score</span>
              <span className="diag-val">{report.score} / 100</span>
            </div>
          </div>
          <p className="diag-disclaimer">
            Optical decode checks verify raster patterns in-browser. Practical scanning depends on physical focal length, surface glare, ink bleed, and lighting. Always test on target physical devices.
          </p>
        </div>
      )}
    </div>
  );
};
