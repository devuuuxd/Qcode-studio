import type { QRType, FormDataMap, AnyFormData } from '../types/qr';

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"'])/g, '\\$1');
}

function unescapeWifiValue(value: string): string {
  return value.replace(/\\([\\;,:"'])/g, '$1');
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

export function parseDecodedPayload(raw: string): { type: QRType; formData: FormDataMap[QRType] } {
  const trimmed = raw.trim();

  if (trimmed.startsWith('WIFI:') || trimmed.startsWith('wifi:')) {
    const ssidMatch = trimmed.match(/(?:WIFI:|;)S:((?:\\;|[^;])*)/i);
    const typeMatch = trimmed.match(/(?:WIFI:|;)T:([^;]*)/i);
    const passMatch = trimmed.match(/(?:WIFI:|;)P:((?:\\;|[^;])*)/i);
    const hiddenMatch = trimmed.match(/(?:WIFI:|;)H:(true|false)/i);

    const ssid = ssidMatch ? unescapeWifiValue(ssidMatch[1]) : '';
    const security = (typeMatch ? typeMatch[1] : 'WPA') as 'WPA' | 'WEP' | 'nopass';
    const password = passMatch ? unescapeWifiValue(passMatch[1]) : '';
    const hidden = hiddenMatch ? hiddenMatch[1].toLowerCase() === 'true' : false;

    return {
      type: 'wifi',
      formData: {
        ssid,
        password,
        security: ['WPA', 'WEP', 'nopass'].includes(security) ? security : 'WPA',
        hidden,
      },
    };
  }

  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const mailtoContent = trimmed.slice(7);
    const [emailPart, queryPart] = mailtoContent.split('?');
    const params = new URLSearchParams(queryPart || '');
    const subject = params.get('subject') || '';
    const message = params.get('body') || '';

    return {
      type: 'email',
      formData: {
        email: decodeURIComponent(emailPart || ''),
        subject,
        message,
      },
    };
  }

  if (trimmed.toLowerCase().startsWith('tel:')) {
    const phonePart = trimmed.slice(4);
    return {
      type: 'phone',
      formData: {
        phone: phonePart,
      },
    };
  }

  if (/^https?:\/\//i.test(trimmed) || /^[\w-]+\.[\w.-]+(\/.*)?$/i.test(trimmed)) {
    return {
      type: 'url',
      formData: {
        url: trimmed,
      },
    };
  }

  return {
    type: 'text',
    formData: {
      text: trimmed,
    },
  };
}
