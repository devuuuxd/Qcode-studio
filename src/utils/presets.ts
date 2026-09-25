import type { QRPreset } from '../types/qr';

export const QR_PRESETS: QRPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Deep obsidian on crisp pure white. Highest optical contrast and universal compatibility.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 4,
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Warm book ink on archival cream. Tactile, balanced, and publication-ready.',
    fgColor: '#1c1917',
    bgColor: '#faf8f5',
    errorCorrectionLevel: 'M',
    margin: 4,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Maritime navy on icy frost white. Distinctive, professional contrast profile.',
    fgColor: '#0b2545',
    bgColor: '#f4f7fa',
    errorCorrectionLevel: 'Q',
    margin: 4,
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Neutral zinc charcoal on soft matte studio grey. Technical and understated.',
    fgColor: '#27272a',
    bgColor: '#f4f4f5',
    errorCorrectionLevel: 'M',
    margin: 4,
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep pine evergreen on pale sage mist. High contrast with organic restraint.',
    fgColor: '#064e3b',
    bgColor: '#f0fdf4',
    errorCorrectionLevel: 'M',
    margin: 4,
  },
];

export const DEFAULT_PRESET = QR_PRESETS[0];

export const DEFAULT_CUSTOMIZATION = {
  size: 360,
  fgColor: DEFAULT_PRESET.fgColor,
  bgColor: DEFAULT_PRESET.bgColor,
  errorCorrectionLevel: DEFAULT_PRESET.errorCorrectionLevel,
  margin: DEFAULT_PRESET.margin,
};
