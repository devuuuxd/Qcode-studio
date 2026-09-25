import { test, expect } from '@playwright/test';

test.describe('Responsiveness, Themes & Modals', () => {
  test('toggles theme between system, light, and dark', async ({ page }) => {
    await page.goto('/');

    const themeBtn = page.locator('.btn-header-theme');
    await expect(themeBtn).toBeVisible();

    await themeBtn.click();
    const theme1 = await page.locator('html').getAttribute('data-theme');
    expect(['light', 'dark']).toContain(theme1);

    await themeBtn.click();
    const theme2 = await page.locator('html').getAttribute('data-theme');
    expect(['light', 'dark']).toContain(theme2);
    expect(theme2).not.toBe(theme1);
  });

  test('maintains responsive layout without horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);

    await page.getByRole('tab', { name: /wi-fi/i }).click();
    await expect(page.locator('#wifi-ssid-input')).toBeVisible();

    await page.locator('#wifi-ssid-input').fill('HomeWifi');
    await page.getByRole('radio', { name: /none \(open\)/i }).click();

    const canvas = page.locator('.workbench-stage .qr-render-canvas');
    await expect(canvas).toBeVisible();
  });

  test('opens and interacts with Share, Config, and Batch modals', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /share/i }).click();
    await expect(page.locator('.modal-title')).toContainText('Share Configuration');
    await page.locator('.btn-modal-close').click();
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();

    await page.getByRole('button', { name: /config/i }).click();
    await expect(page.locator('.modal-title')).toContainText('Config & QR Tools');
    await page.locator('.btn-modal-close').click();
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();

    await page.getByRole('button', { name: /batch/i }).click();
    await expect(page.locator('.modal-title')).toContainText('Batch QR Generator');
    await page.locator('.btn-modal-close').click();
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });
});
