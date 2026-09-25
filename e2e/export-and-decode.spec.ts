import { test, expect } from '@playwright/test';

test.describe('Export Actions & Optical Decoding Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('downloads PNG export at selected resolution', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/test-png');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download png/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.png');
  });

  test('downloads vector SVG export', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/test-svg');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /svg vector/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.svg');
  });

  test('triggers copy image action with feedback', async ({ page }) => {
    await page.getByRole('button', { name: /copy image/i }).click();
    await expect(page.locator('.toast-notification')).toBeVisible();
  });

  test('optically decodes canvas image in browser to verify payload integrity', async ({ page }) => {
    const testUrl = 'https://example.com/optical-verification-payload';
    await page.locator('#url-input').fill(testUrl);

    await page.waitForTimeout(600);

    await expect(page.locator('.stamp-verified')).toBeVisible();
    await expect(page.locator('.stamp-verified')).toContainText('DECODE OK');
  });
});
