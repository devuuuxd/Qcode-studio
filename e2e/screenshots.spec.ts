import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('capture production screenshots', async ({ page }) => {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.fill('#url-input', 'https://github.com/google/gemini');
  await page.waitForSelector('.workbench-stage .qr-render-canvas');
  await page.waitForSelector('.stamp-verified', { timeout: 10000 });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(screenshotsDir, 'desktop.png'),
    fullPage: false,
  });

  await page.locator('.module-style-btn').nth(1).click();
  await page.locator('.custom-checkbox-label input[type="checkbox"]').check();

  const detailsBtn = page.getByRole('button', { name: /details/i });
  if (await detailsBtn.count() > 0) {
    await detailsBtn.click();
  }
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'customization.png'),
    fullPage: false,
  });

  await page.evaluate(() => {
    const mockHistory = [
      {
        id: 'hist-1',
        type: 'wifi',
        title: 'Studio_Guest_5G',
        customName: 'Studio Guest Wi-Fi',
        pinned: true,
        payload: 'WIFI:T:WPA;S:Studio_Guest_5G;P:supersecret2026;;',
        formData: { ssid: 'Studio_Guest_5G', password: 'supersecret2026', encryption: 'WPA' },
        customization: {
          fgColor: '#000000',
          bgColor: '#ffffff',
          moduleStyle: 'rounded',
          gradientEnabled: true,
          gradientColor: '#333333',
          gradientDirection: 'diagonal',
          margin: 4,
          errorCorrectionLevel: 'M',
          size: 320,
          label: '',
        },
        timestamp: Date.now() - 1000 * 60 * 5,
      },
      {
        id: 'hist-2',
        type: 'url',
        title: 'github.com/google/gemini',
        pinned: false,
        payload: 'https://github.com/google/gemini',
        formData: { url: 'https://github.com/google/gemini' },
        customization: {
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          moduleStyle: 'square',
          gradientEnabled: false,
          margin: 4,
          errorCorrectionLevel: 'H',
          size: 320,
          label: '',
        },
        timestamp: Date.now() - 1000 * 60 * 45,
      },
      {
        id: 'hist-3',
        type: 'email',
        title: 'press@qcode.studio',
        pinned: false,
        payload: 'mailto:press@qcode.studio?subject=Inquiry',
        formData: { email: 'press@qcode.studio', subject: 'Inquiry', body: '' },
        customization: {
          fgColor: '#1e1b24',
          bgColor: '#f4efe8',
          moduleStyle: 'dots',
          gradientEnabled: false,
          margin: 4,
          errorCorrectionLevel: 'M',
          size: 320,
          label: '',
        },
        timestamp: Date.now() - 1000 * 60 * 180,
      },
      {
        id: 'hist-4',
        type: 'phone',
        title: '+1 555-019-2834',
        pinned: false,
        payload: 'tel:+15550192834',
        formData: { phone: '+1 555-019-2834' },
        customization: {
          fgColor: '#132a13',
          bgColor: '#ecf39e',
          moduleStyle: 'rounded',
          gradientEnabled: false,
          margin: 4,
          errorCorrectionLevel: 'Q',
          size: 320,
          label: '',
        },
        timestamp: Date.now() - 1000 * 60 * 600,
      },
    ];
    localStorage.setItem('qr_designer_history_v1', JSON.stringify(mockHistory));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.tape-item');
  await page.waitForTimeout(400);

  const historyEl = page.locator('.recent-tape-container');
  await historyEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await historyEl.screenshot({
    path: path.join(screenshotsDir, 'history.png'),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.fill('#url-input', 'https://qcode.studio');
  await page.waitForSelector('.workbench-stage .qr-render-canvas');
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'mobile.png'),
    fullPage: false,
  });
});
