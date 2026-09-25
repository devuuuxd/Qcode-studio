import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const storageMap = new Map<string, string>();
const mockStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, val: string) => storageMap.set(key, val),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
(globalThis as any).localStorage = mockStorage;

import { parseDecodedPayload } from '../qrPayload.ts';
import { evaluateScanSafety } from '../scanSafety.ts';
import {
  exportConfiguration,
  validateAndParseConfig,
  encodeShareableConfig,
  decodeShareableConfig,
  saveTemplate,
  loadTemplates,
  deleteTemplate,
  saveHistoryItem,
  loadHistory,
  togglePinHistoryItem,
  renameHistoryItem,
} from '../storage.ts';

describe('QR Payload Parser Standards', () => {
  it('parses decoded WiFi ZXing strings into structured form data', () => {
    const raw = 'WIFI:S:GuestNetwork;T:WPA;P:secret123;H:false;;';
    const parsed = parseDecodedPayload(raw);
    assert.equal(parsed.type, 'wifi');
    assert.deepEqual(parsed.formData, {
      ssid: 'GuestNetwork',
      password: 'secret123',
      security: 'WPA',
      hidden: false,
    });
  });

  it('parses decoded mailto strings into structured form data', () => {
    const raw = 'mailto:hello@example.com?subject=Inquiry&body=Testing%20Body';
    const parsed = parseDecodedPayload(raw);
    assert.equal(parsed.type, 'email');
    assert.deepEqual(parsed.formData, {
      email: 'hello@example.com',
      subject: 'Inquiry',
      message: 'Testing Body',
    });
  });

  it('parses decoded tel strings into phone form data', () => {
    const raw = 'tel:+15551234567';
    const parsed = parseDecodedPayload(raw);
    assert.equal(parsed.type, 'phone');
    assert.deepEqual(parsed.formData, {
      phone: '+15551234567',
    });
  });

  it('parses URLs and plain text accurately', () => {
    const url = parseDecodedPayload('https://example.com/demo');
    assert.equal(url.type, 'url');
    assert.equal(url.formData.url, 'https://example.com/demo');

    const text = parseDecodedPayload('Just a plain text message');
    assert.equal(text.type, 'text');
    assert.equal(text.formData.text, 'Just a plain text message');
  });
});

describe('Advanced Scan Safety Rules', () => {
  it('detects low contrast on gradient secondary colors', () => {
    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#000000',
        bgColor: '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 4,
        moduleStyle: 'square',
        gradientEnabled: true,
        gradientColor: '#eeeeee',
        gradientDirection: 'vertical',
        logoDataUrl: null,
        logoSize: 20,
        label: '',
      },
      50
    );

    assert.ok(report.issues.some((i) => i.id === 'critical-gradient-contrast'));
    assert.equal(report.status, 'critical');
  });

  it('warns when logo is active with sub-optimal error correction', () => {
    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#000000',
        bgColor: '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 4,
        moduleStyle: 'square',
        gradientEnabled: false,
        gradientColor: '#333333',
        gradientDirection: 'vertical',
        logoDataUrl: 'data:image/png;base64,sample',
        logoSize: 20,
        label: '',
      },
      50
    );

    assert.equal(report.logoRisk, true);
    assert.ok(report.issues.some((i) => i.id === 'warning-logo-ecl'));
  });

  it('flags optical decode failure integration', () => {
    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#000000',
        bgColor: '#ffffff',
        errorCorrectionLevel: 'H',
        margin: 4,
        moduleStyle: 'square',
        gradientEnabled: false,
        gradientColor: '#333333',
        gradientDirection: 'vertical',
        logoDataUrl: null,
        logoSize: 20,
        label: '',
      },
      50,
      { success: false, error: 'Unreadable matrix' }
    );

    assert.equal(report.decodeVerified, false);
    assert.ok(report.issues.some((i) => i.id === 'warning-optical-decode-failed'));
  });
});

describe('Templates & Shareable Config', () => {
  it('saves, loads, and deletes custom templates', () => {
    const custom = {
      size: 400,
      fgColor: '#0b2545',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'Q' as const,
      margin: 4,
      moduleStyle: 'rounded' as const,
      gradientEnabled: false,
      gradientColor: '#134074',
      gradientDirection: 'vertical' as const,
      logoDataUrl: null,
      logoSize: 20,
      label: 'Brand Style',
    };

    saveTemplate('Brand Navy', custom);
    const tmpls = loadTemplates();
    assert.ok(tmpls.some((t) => t.name === 'Brand Navy'));

    const target = tmpls.find((t) => t.name === 'Brand Navy')!;
    deleteTemplate(target.id);
    const afterDel = loadTemplates();
    assert.ok(!afterDel.some((t) => t.id === target.id));
  });

  it('validates and safely parses configuration exports', () => {
    const config = exportConfiguration(
      'url',
      { url: 'https://example.com' },
      {
        size: 360,
        fgColor: '#000000',
        bgColor: '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 4,
        moduleStyle: 'square',
        gradientEnabled: false,
        gradientColor: '#333333',
        gradientDirection: 'vertical',
        logoDataUrl: null,
        logoSize: 20,
        label: '',
      }
    );

    const validJson = JSON.stringify(config);
    const parsed = validateAndParseConfig(validJson);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.data?.type, 'url');

    const invalidType = validateAndParseConfig(JSON.stringify({ type: 'unknown_type' }));
    assert.equal(invalidType.valid, false);

    const malformed = validateAndParseConfig('{corrupt');
    assert.equal(malformed.valid, false);
  });

  it('encodes and decodes shareable configuration links', () => {
    const custom = {
      size: 512,
      fgColor: '#1c1917',
      bgColor: '#faf8f5',
      errorCorrectionLevel: 'H' as const,
      margin: 4,
      moduleStyle: 'dots' as const,
      gradientEnabled: true,
      gradientColor: '#44403c',
      gradientDirection: 'diagonal' as const,
      logoDataUrl: null,
      logoSize: 20,
      label: 'Shared Spec',
    };

    const encoded = encodeShareableConfig('text', { text: 'Secret message' }, custom);
    assert.ok(encoded.length > 0);

    const decoded = decodeShareableConfig(`#config=${encoded}`);
    assert.equal(decoded.valid, true);
    assert.ok(decoded.data);
    assert.equal(decoded.data.type, 'text');
    assert.equal((decoded.data.formData as any).text, 'Secret message');
    assert.equal(decoded.data.customization.moduleStyle, 'dots');
    assert.equal(decoded.data.customization.gradientEnabled, true);
  });

  it('manages history pinning and custom renaming', () => {
    const custom = {
      size: 360,
      fgColor: '#000000',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'M' as const,
      margin: 4,
      moduleStyle: 'square' as const,
      gradientEnabled: false,
      gradientColor: '#333333',
      gradientDirection: 'vertical' as const,
      logoDataUrl: null,
      logoSize: 20,
      label: '',
    };

    saveHistoryItem('url', 'Initial Title', 'https://example.com/unique-test', { url: 'https://example.com/unique-test' }, custom);
    const items = loadHistory();
    const item = items.find((i) => i.payload === 'https://example.com/unique-test')!;
    assert.ok(item);

    renameHistoryItem(item.id, 'Renamed Bookmark');
    const renamed = loadHistory().find((i) => i.id === item.id);
    assert.equal(renamed?.customName, 'Renamed Bookmark');

    togglePinHistoryItem(item.id);
    const pinned = loadHistory();
    assert.equal(pinned[0].id, item.id);
    assert.equal(pinned[0].pinned, true);
  });
});
