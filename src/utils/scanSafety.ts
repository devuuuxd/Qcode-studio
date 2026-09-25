import type { QRCustomization, ScanSafetyReport, ScanSafetyIssue, ScanSafetyStatus } from '../types/qr';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function getsRgbLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): {
  ratio: number;
  fgLum: number;
  bgLum: number;
  isInverted: boolean;
} {
  const fgRgb = hexToRgb(fgHex) || { r: 15, g: 23, b: 42 };
  const bgRgb = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };

  const fgLum = getsRgbLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getsRgbLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  const isInverted = fgLum > bgLum;

  return {
    ratio: Math.round(ratio * 100) / 100,
    fgLum,
    bgLum,
    isInverted,
  };
}

export function evaluateScanSafety(
  customization: QRCustomization,
  payloadLength: number
): ScanSafetyReport {
  const { ratio, isInverted } = calculateContrastRatio(
    customization.fgColor,
    customization.bgColor
  );

  const issues: ScanSafetyIssue[] = [];
  let score = 100;

  if (ratio < 2.5) {
    score -= 60;
    issues.push({
      id: 'critical-low-contrast',
      severity: 'critical',
      title: 'Critical: Insufficient Contrast',
      message: `Contrast ratio is ${ratio.toFixed(2)}:1. Optical camera sensors cannot reliably differentiate code modules from the background.`,
      remedy: 'Increase the luminance difference between foreground and background (aim for at least 4.5:1).',
      suggestedAction: 'reset-contrast',
    });
  } else if (ratio < 4.5) {
    score -= 30;
    issues.push({
      id: 'warning-low-contrast',
      severity: 'warning',
      title: 'Warning: Low Contrast',
      message: `Contrast ratio is ${ratio.toFixed(2)}:1. May scan slowly or fail entirely under dim indoor lighting or screen reflections.`,
      remedy: 'Darken the foreground or lighten the background to reach at least 7.0:1.',
      suggestedAction: 'reset-contrast',
    });
  } else if (ratio < 7.0) {
    score -= 10;
    issues.push({
      id: 'info-acceptable-contrast',
      severity: 'info',
      title: 'Acceptable Contrast',
      message: `Contrast ratio is ${ratio.toFixed(2)}:1. Suitable for clear digital screens, though higher contrast is recommended for physical prints.`,
    });
  }

  if (isInverted) {
    score -= 20;
    issues.push({
      id: 'warning-inverted-color',
      severity: 'warning',
      title: 'Notice: Inverted Light-on-Dark Scheme',
      message: 'Light modules on a dark background are not supported by all native camera apps or dedicated handheld barcode scanners.',
      remedy: 'Swap foreground and background so modules are darker than the surrounding canvas.',
      suggestedAction: 'invert-colors',
    });
  }

  const quietZone = customization.margin;
  const isMarginUnsafe = quietZone < 2;

  if (quietZone === 0) {
    score -= 35;
    issues.push({
      id: 'critical-no-margin',
      severity: 'critical',
      title: 'Missing Quiet Zone',
      message: 'ISO/IEC 18004 specifies a mandatory quiet zone around finder patterns. Zero margin causes scanners to miss edges when placed on textured surfaces.',
      remedy: 'Set quiet zone margin to at least 2 modules (standard is 4).',
      suggestedAction: 'increase-margin',
    });
  } else if (quietZone < 2) {
    score -= 15;
    issues.push({
      id: 'warning-small-margin',
      severity: 'warning',
      title: 'Narrow Quiet Zone',
      message: `Quiet zone is currently ${quietZone} module. Background elements close to the code can interfere with pattern detection.`,
      remedy: 'Increase quiet zone to 3 or 4 modules for reliable framing.',
      suggestedAction: 'increase-margin',
    });
  }

  const isDense = payloadLength > 180 && customization.errorCorrectionLevel === 'H';
  if (isDense) {
    score -= 15;
    issues.push({
      id: 'info-dense-payload',
      severity: 'info',
      title: 'High Module Density',
      message: `With ${payloadLength} characters and High (30%) error correction, the grid has very fine modules that demand high camera resolution.`,
      remedy: 'Consider reducing Error Correction to Medium (15%) or shortening text for cleaner readability at smaller print sizes.',
      suggestedAction: 'lower-ecl',
    });
  }

  score = Math.max(0, Math.min(100, score));

  let status: ScanSafetyStatus = 'optimal';
  if (issues.some((i) => i.severity === 'critical')) {
    status = 'critical';
  } else if (issues.some((i) => i.severity === 'warning')) {
    status = 'warning';
  } else if (issues.some((i) => i.severity === 'info') || score < 85) {
    status = 'acceptable';
  }

  return {
    status,
    contrastRatio: ratio,
    isInverted,
    quietZoneModules: quietZone,
    isMarginUnsafe,
    isDense,
    score,
    issues,
  };
}
