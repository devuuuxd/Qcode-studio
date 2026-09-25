export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleStyle = 'square' | 'rounded' | 'dots';

export type GradientDirection = 'none' | 'vertical' | 'horizontal' | 'diagonal';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UrlFormData {
  url: string;
}

export interface TextFormData {
  text: string;
}

export interface EmailFormData {
  email: string;
  subject: string;
  message: string;
}

export interface PhoneFormData {
  phone: string;
}

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

export interface WifiFormData {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}

export interface FormDataMap {
  url: UrlFormData;
  text: TextFormData;
  email: EmailFormData;
  phone: PhoneFormData;
  wifi: WifiFormData;
}

export type AnyFormData = UrlFormData | TextFormData | EmailFormData | PhoneFormData | WifiFormData;

export interface QRCustomization {
  size: number;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  moduleStyle: ModuleStyle;
  gradientEnabled: boolean;
  gradientColor: string;
  gradientDirection: GradientDirection;
  logoDataUrl: string | null;
  logoSize: number;
  label: string;
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  moduleStyle?: ModuleStyle;
  gradientEnabled?: boolean;
  gradientColor?: string;
  gradientDirection?: GradientDirection;
}

export interface QRTemplate {
  id: string;
  name: string;
  createdAt: number;
  customization: QRCustomization;
}

export interface ScanSafetyIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  remedy?: string;
  suggestedAction?: 'reset-contrast' | 'increase-margin' | 'invert-colors' | 'lower-ecl' | 'boost-ecl' | 'reduce-logo';
}

export type ScanSafetyStatus = 'optimal' | 'acceptable' | 'warning' | 'critical';

export interface ScanSafetyReport {
  status: ScanSafetyStatus;
  contrastRatio: number;
  gradientContrastRatio?: number;
  isInverted: boolean;
  quietZoneModules: number;
  isMarginUnsafe: boolean;
  isDense: boolean;
  logoRisk: boolean;
  patternRisk: boolean;
  score: number;
  issues: ScanSafetyIssue[];
  decodeVerified?: boolean | null;
  decodeMessage?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRType;
  title: string;
  payload: string;
  formData: AnyFormData;
  customization: QRCustomization;
  presetId?: string;
  pinned?: boolean;
  customName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ConfigExport {
  version: string;
  timestamp: number;
  type: QRType;
  formData: AnyFormData;
  customization: QRCustomization;
}
