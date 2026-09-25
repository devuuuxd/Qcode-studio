import type { QRType, FormDataMap, ValidationResult } from '../types/qr';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateQrForm(type: QRType, data: FormDataMap[QRType]): ValidationResult {
  const errors: Record<string, string> = {};

  switch (type) {
    case 'url': {
      const urlData = data as FormDataMap['url'];
      const raw = urlData.url.trim();

      if (!raw) {
        errors.url = 'Destination URL is required.';
        break;
      }

      try {
        const testUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        const parsed = new URL(testUrl);

        if (!parsed.hostname || !parsed.hostname.includes('.')) {
          errors.url = 'Please enter a valid domain name (e.g., example.com).';
        } else if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          errors.url = 'URL protocol must be http:// or https://.';
        }
      } catch {
        errors.url = 'Invalid URL format.';
      }
      break;
    }

    case 'text': {
      const textData = data as FormDataMap['text'];
      const text = textData.text.trim();

      if (!text) {
        errors.text = 'Text content cannot be empty.';
      } else if (text.length > 2000) {
        errors.text = `Content length (${text.length} chars) exceeds maximum recommended QR capacity (2000 chars).`;
      }
      break;
    }

    case 'email': {
      const emailData = data as FormDataMap['email'];
      const email = emailData.email.trim();

      if (!email) {
        errors.email = 'Recipient email address is required.';
      } else if (!EMAIL_REGEX.test(email)) {
        errors.email = 'Please enter a valid email address (e.g., user@domain.com).';
      }

      if (emailData.subject && emailData.subject.length > 250) {
        errors.subject = 'Subject should be under 250 characters.';
      }
      break;
    }

    case 'phone': {
      const phoneData = data as FormDataMap['phone'];
      const raw = phoneData.phone.trim();

      if (!raw) {
        errors.phone = 'Phone number is required.';
        break;
      }

      const digitsOnly = raw.replace(/\D/g, '');
      if (digitsOnly.length < 5) {
        errors.phone = 'Phone number must contain at least 5 digits.';
      } else if (digitsOnly.length > 15) {
        errors.phone = 'Phone number cannot exceed 15 digits (ITU-T E.164).';
      } else if (!/^\+?[\d\s\-().]+$/.test(raw)) {
        errors.phone = 'Contains invalid characters. Use numbers, spaces, and optional + prefix.';
      }
      break;
    }

    case 'wifi': {
      const wifiData = data as FormDataMap['wifi'];
      const ssid = wifiData.ssid.trim();

      if (!ssid) {
        errors.ssid = 'Network name (SSID) is required.';
      } else if (ssid.length > 32) {
        errors.ssid = 'SSID must not exceed 32 characters.';
      }

      if (wifiData.security === 'WPA') {
        const pass = wifiData.password;
        if (!pass) {
          errors.password = 'WPA/WPA2 password is required.';
        } else if (pass.length < 8) {
          errors.password = 'WPA/WPA2 passphrases must be at least 8 characters.';
        } else if (pass.length > 63) {
          errors.password = 'WPA passphrases cannot exceed 63 characters.';
        }
      } else if (wifiData.security === 'WEP') {
        const pass = wifiData.password;
        if (!pass) {
          errors.password = 'WEP key is required.';
        } else if (![5, 10, 13, 26].includes(pass.length)) {
          errors.password = 'Standard WEP keys must be 5 or 13 ASCII chars (or 10/26 hex digits).';
        }
      }
      break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
