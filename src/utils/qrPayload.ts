import type { QRType, FormDataMap, AnyFormData } from '../types/qr';

/**
 * Escapes reserved characters in Wi-Fi SSID and Password strings
 * according to the ZXing barcode standard (backslash-escaped: \, ;, ,, :, ")
 */
function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"'])/g, '\\$1');
}

export function buildQrPayload(type: QRType, data: AnyFormData): string {
  switch (type) {
    case 'url': {
      const urlData = data as FormDataMap['url'];
      const raw = urlData.url.trim();
      if (!raw) return '';
      if (!/^https?:\/\//i.test(raw) && /^[\w-]+\.[\w.-]+/i.test(raw)) {
        return `https://${raw}`;
      }
      return raw;
    }

    case 'text': {
      const textData = data as FormDataMap['text'];
      return textData.text;
    }

    case 'email': {
      const emailData = data as FormDataMap['email'];
      const email = emailData.email.trim();
      if (!email) return '';

      const params = new URLSearchParams();
      if (emailData.subject.trim()) {
        params.append('subject', emailData.subject.trim());
      }
      if (emailData.message.trim()) {
        params.append('body', emailData.message.trim());
      }

      const queryString = params.toString();
      const formattedQuery = queryString ? `?${queryString.replace(/\+/g, '%20')}` : '';
      return `mailto:${email}${formattedQuery}`;
    }

    case 'phone': {
      const phoneData = data as FormDataMap['phone'];
      const raw = phoneData.phone.trim();
      if (!raw) return '';
      const sanitized = raw.replace(/[^\d+*#]/g, '');
      return `tel:${sanitized}`;
    }

    case 'wifi': {
      const wifiData = data as FormDataMap['wifi'];
      const ssid = wifiData.ssid.trim();
      if (!ssid) return '';

      const escapedSsid = escapeWifiValue(ssid);
      const security = wifiData.security;
      const hidden = wifiData.hidden;

      let payload = `WIFI:S:${escapedSsid};T:${security};`;
      if (security !== 'nopass' && wifiData.password) {
        payload += `P:${escapeWifiValue(wifiData.password)};`;
      }
      if (hidden) {
        payload += 'H:true;';
      }
      payload += ';';
      return payload;
    }

    default:
      return '';
  }
}

export function getPayloadSummary(type: QRType, data: AnyFormData): string {
  switch (type) {
    case 'url': {
      const url = (data as FormDataMap['url']).url.trim();
      try {
        const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
        return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
      } catch {
        return url || 'Empty URL';
      }
    }
    case 'text': {
      const text = (data as FormDataMap['text']).text.trim();
      if (!text) return 'Empty plain text';
      return text.length > 36 ? `${text.slice(0, 36)}…` : text;
    }
    case 'email': {
      const email = (data as FormDataMap['email']).email.trim();
      const subject = (data as FormDataMap['email']).subject.trim();
      return subject ? `${email} (${subject})` : email || 'Empty email';
    }
    case 'phone': {
      const phone = (data as FormDataMap['phone']).phone.trim();
      return phone || 'Empty phone number';
    }
    case 'wifi': {
      const wifi = data as FormDataMap['wifi'];
      return wifi.ssid ? `Wi-Fi: ${wifi.ssid} (${wifi.security})` : 'Unnamed Wi-Fi network';
    }
    default:
      return 'QR Code';
  }
}
