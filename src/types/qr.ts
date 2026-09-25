export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

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
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
}

export interface ScanSafetyIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  remedy?: string;
  suggestedAction?: 'reset-contrast' | 'increase-margin' | 'invert-colors' | 'lower-ecl';
}

export type ScanSafetyStatus = 'optimal' | 'acceptable' | 'warning' | 'critical';

export interface ScanSafetyReport {
  status: ScanSafetyStatus;
  contrastRatio: number;
  isInverted: boolean;
  quietZoneModules: number;
  isMarginUnsafe: boolean;
  isDense: boolean;
  score: number;
  issues: ScanSafetyIssue[];
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
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
