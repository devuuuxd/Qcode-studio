import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildQrPayload, getPayloadSummary } from '../qrPayload.ts';
import { validateQrForm } from '../validation.ts';
import { calculateContrastRatio, evaluateScanSafety } from '../scanSafety.ts';
import { QR_PRESETS } from '../presets.ts';

describe('QR Payload Formatting Standards', () => {
  it('correctly formats URL with scheme and normalizes naked domains', () => {
    const p1 = buildQrPayload('url', { url: 'https://example.com/path?a=1' });
    assert.equal(p1, 'https://example.com/path?a=1');

    const p2 = buildQrPayload('url', { url: 'sub.domain.co/page' });
    assert.equal(p2, 'https://sub.domain.co/page');
  });

  it('preserves plain text intact', () => {
    const raw = 'Special characters: !@#$%^&*()_+ UTF-8: こんにちは 🚀';
    const p = buildQrPayload('text', { text: raw });
    assert.equal(p, raw);
  });

  it('formats RFC 6068 mailto URIs with proper URL encoding', () => {
    const p1 = buildQrPayload('email', {
      email: 'lead@company.com',
      subject: 'Job Application',
      message: 'Hello! Pleased to meet you.',
    });
    assert.equal(p1, 'mailto:lead@company.com?subject=Job%20Application&body=Hello%21%20Pleased%20to%20meet%20you.');

    const p2 = buildQrPayload('email', {
      email: 'solo@domain.org',
      subject: '',
      message: '',
    });
    assert.equal(p2, 'mailto:solo@domain.org');
  });

  it('formats RFC 3966 tel URIs by stripping formatting spaces and brackets', () => {
    const p = buildQrPayload('phone', { phone: '+1 (555) 867-5309' });
    assert.equal(p, 'tel:+15558675309');
  });

  it('formats ZXing Wi-Fi standard payloads and properly escapes special characters', () => {
    const p1 = buildQrPayload('wifi', {
      ssid: 'Guest;Office,5G:Test\\Home"Net',
      password: 'p;a,s:s\\w"ord',
      security: 'WPA',
      hidden: true,
    });
    assert.equal(
      p1,
      'WIFI:S:Guest\\;Office\\,5G\\:Test\\\\Home\\"Net;T:WPA;P:p\\;a\\,s\\:s\\\\w\\"ord;H:true;;'
    );

    const p2 = buildQrPayload('wifi', {
      ssid: 'PublicCoffee',
      password: '',
      security: 'nopass',
      hidden: false,
    });
    assert.equal(p2, 'WIFI:S:PublicCoffee;T:nopass;;');
  });

  it('generates clean, human-readable summaries for history preview', () => {
    assert.equal(getPayloadSummary('url', { url: 'https://github.com/google/gemini' }), 'github.com/google/gemini');
    assert.equal(getPayloadSummary('text', { text: 'Quick summary sample' }), 'Quick summary sample');
    assert.equal(getPayloadSummary('email', { email: 'dev@company.com', subject: 'Invoice #104', message: '' }), 'dev@company.com (Invoice #104)');
    assert.equal(getPayloadSummary('phone', { phone: '+1 555 0199' }), '+1 555 0199');
    assert.equal(getPayloadSummary('wifi', { ssid: 'LabNetwork', password: 'secret', security: 'WPA', hidden: false }), 'Wi-Fi: LabNetwork (WPA)');
  });
});

describe('Input Form Validation Rules', () => {
  it('validates URLs accurately', () => {
    const valid = validateQrForm('url', { url: 'https://github.com' });
    assert.equal(valid.isValid, true);
    assert.equal(Object.keys(valid.errors).length, 0);

    const invalidEmpty = validateQrForm('url', { url: '' });
    assert.equal(invalidEmpty.isValid, false);
    assert.ok(invalidEmpty.errors.url);

    const invalidProtocol = validateQrForm('url', { url: 'ftp://not-http.org' });
    assert.equal(invalidProtocol.isValid, false);
    assert.ok(invalidProtocol.errors.url);

    const invalidDomain = validateQrForm('url', { url: 'justsomestringwithnodot' });
    assert.equal(invalidDomain.isValid, false);
    assert.ok(invalidDomain.errors.url);
  });

  it('validates plain text constraints', () => {
    const valid = validateQrForm('text', { text: 'Some note' });
    assert.equal(valid.isValid, true);

    const empty = validateQrForm('text', { text: '   ' });
    assert.equal(empty.isValid, false);
    assert.ok(empty.errors.text);
  });

  it('validates email addresses against RFC 5322 structure', () => {
    const valid = validateQrForm('email', { email: 'dev@studio.design', subject: '', message: '' });
    assert.equal(valid.isValid, true);

    const invalidNoAt = validateQrForm('email', { email: 'missing-at-sign.com', subject: '', message: '' });
    assert.equal(invalidNoAt.isValid, false);
    assert.ok(invalidNoAt.errors.email);

    const invalidNoDomain = validateQrForm('email', { email: 'user@nodomain', subject: '', message: '' });
    assert.equal(invalidNoDomain.isValid, false);
    assert.ok(invalidNoDomain.errors.email);
  });

  it('validates phone numbers according to length and characters', () => {
    const valid = validateQrForm('phone', { phone: '+1 555 444 3322' });
    assert.equal(valid.isValid, true);

    const tooShort = validateQrForm('phone', { phone: '123' });
    assert.equal(tooShort.isValid, false);
    assert.ok(tooShort.errors.phone);

    const invalidChars = validateQrForm('phone', { phone: '+1-555-CALL-NOW' });
    assert.equal(invalidChars.isValid, false);
    assert.ok(invalidChars.errors.phone);
  });

  it('validates Wi-Fi network parameters per security mode', () => {
    const validWpa = validateQrForm('wifi', {
      ssid: 'CorpGuest',
      password: 'password123',
      security: 'WPA',
      hidden: false,
    });
    assert.equal(validWpa.isValid, true);

    const noSsid = validateQrForm('wifi', {
      ssid: '',
      password: 'password123',
      security: 'WPA',
      hidden: false,
    });
    assert.equal(noSsid.isValid, false);
    assert.ok(noSsid.errors.ssid);

    const shortWpa = validateQrForm('wifi', {
      ssid: 'HomeNet',
      password: 'short',
      security: 'WPA',
      hidden: false,
    });
    assert.equal(shortWpa.isValid, false);
    assert.ok(shortWpa.errors.password);

    const validOpen = validateQrForm('wifi', {
      ssid: 'OpenMesh',
      password: '',
      security: 'nopass',
      hidden: false,
    });
    assert.equal(validOpen.isValid, true);
  });
});

describe('Scan Reliability & Color Science Analysis', () => {
  it('calculates WCAG contrast ratio correctly for high-contrast pairs', () => {
    const blackWhite = calculateContrastRatio('#000000', '#ffffff');
    assert.equal(Math.round(blackWhite.ratio), 21);
    assert.equal(blackWhite.isInverted, false);

    const whiteBlack = calculateContrastRatio('#ffffff', '#000000');
    assert.equal(Math.round(whiteBlack.ratio), 21);
    assert.equal(whiteBlack.isInverted, true);
  });

  it('accurately identifies low contrast danger zones', () => {
    const lowContrast = calculateContrastRatio('#888888', '#999999');
    assert.ok(lowContrast.ratio < 2.0);

    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#888888',
        bgColor: '#999999',
        errorCorrectionLevel: 'M',
        margin: 4,
      },
      50
    );

    assert.equal(report.status, 'critical');
    assert.ok(report.issues.some((i) => i.id === 'critical-low-contrast'));
  });

  it('flags inverted color schemes with clear scanner compatibility warnings', () => {
    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#ffffff',
        bgColor: '#0f172a',
        errorCorrectionLevel: 'M',
        margin: 4,
      },
      50
    );

    assert.equal(report.isInverted, true);
    assert.ok(report.issues.some((i) => i.id === 'warning-inverted-color'));
  });

  it('detects missing quiet zone margin violations', () => {
    const report = evaluateScanSafety(
      {
        size: 360,
        fgColor: '#000000',
        bgColor: '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 0,
      },
      50
    );

    assert.equal(report.status, 'critical');
    assert.ok(report.issues.some((i) => i.id === 'critical-no-margin'));
  });

  it('validates all built-in presets pass high-contrast scannability', () => {
    for (const preset of QR_PRESETS) {
      const report = evaluateScanSafety(
        {
          size: 360,
          fgColor: preset.fgColor,
          bgColor: preset.bgColor,
          errorCorrectionLevel: preset.errorCorrectionLevel,
          margin: preset.margin,
        },
        50
      );

      assert.notEqual(report.status, 'critical', `Preset ${preset.name} must never be critical`);
      assert.ok(report.contrastRatio >= 7.0, `Preset ${preset.name} must have ratio >= 7.0 (got ${report.contrastRatio})`);
      assert.equal(report.isInverted, false, `Preset ${preset.name} must not be inverted`);
    }
  });
});

describe('LocalStorage Cache Resilience & Deduplication', async () => {
  const storageMap = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, val: string) => storageMap.set(key, val),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  };
  (globalThis as any).localStorage = mockStorage;

  const { loadHistory, saveHistoryItem, deleteHistoryItem, clearAllHistory } = await import('../storage.ts');

  it('gracefully handles corrupted JSON in localStorage without throwing', () => {
    mockStorage.setItem('qr_designer_history_v1', '{corrupt json!!!}');
    const items = loadHistory();
    assert.deepEqual(items, []);
  });

  it('filters out non-array and malformed entries', () => {
    mockStorage.setItem('qr_designer_history_v1', JSON.stringify({ notAnArray: true }));
    assert.deepEqual(loadHistory(), []);

    mockStorage.setItem(
      'qr_designer_history_v1',
      JSON.stringify([{ invalid: 'object' }, null, 42])
    );
    assert.deepEqual(loadHistory(), []);
  });

  it('saves, deduplicates, and caps history items at maximum 12', () => {
    mockStorage.clear();

    const sampleCustomization = {
      size: 360,
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      errorCorrectionLevel: 'M' as const,
      margin: 4,
    };

    for (let i = 1; i <= 15; i++) {
      saveHistoryItem(
        'url',
        `Site ${i}`,
        `https://example.com/${i}`,
        { url: `https://example.com/${i}` },
        sampleCustomization
      );
    }

    const saved = loadHistory();
    assert.equal(saved.length, 12, 'History must be capped at 12 items');
    assert.equal(saved[0].title, 'Site 15', 'Most recent item should be at the front');

    saveHistoryItem(
      'url',
      'Site 15',
      'https://example.com/15',
      { url: 'https://example.com/15' },
      sampleCustomization
    );

    const afterDedup = loadHistory();
    assert.equal(afterDedup.length, 12);
    assert.equal(afterDedup[0].title, 'Site 15');
  });

  it('deletes individual items and clears all', () => {
    const list = loadHistory();
    const targetId = list[0].id;

    const remaining = deleteHistoryItem(targetId);
    assert.equal(remaining.length, 11);
    assert.ok(!remaining.some((item) => item.id === targetId));

    clearAllHistory();
    assert.deepEqual(loadHistory(), []);
  });
});
