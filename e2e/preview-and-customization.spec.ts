import { test, expect } from '@playwright/test';

test.describe('QR Customization & Live Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders live QR canvas when valid input is entered', async ({ page }) => {
    const canvas = page.locator('.workbench-stage .qr-render-canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('switches color presets accurately', async ({ page }) => {
    await page.getByRole('button', { name: /midnight/i }).click();
    await expect(page.locator('#fg-color-hex')).toHaveValue('#0B2545');
    await expect(page.locator('#bg-color-hex')).toHaveValue('#F4F7FA');

    await page.getByRole('button', { name: /editorial/i }).click();
    await expect(page.locator('#fg-color-hex')).toHaveValue('#1C1917');
    await expect(page.locator('#bg-color-hex')).toHaveValue('#FAF8F5');
  });

  test('swaps foreground and background colors', async ({ page }) => {
    const fg = await page.locator('#fg-color-hex').inputValue();
    const bg = await page.locator('#bg-color-hex').inputValue();

    await page.getByRole('button', { name: /swap colors/i }).click();

    await expect(page.locator('#fg-color-hex')).toHaveValue(bg);
    await expect(page.locator('#bg-color-hex')).toHaveValue(fg);
  });

  test('applies module styles: square, rounded, and dots', async ({ page }) => {
    await page.getByRole('radio', { name: /rounded/i }).click();
    await expect(page.getByRole('radio', { name: /rounded/i })).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('radio', { name: /dots/i }).click();
    await expect(page.getByRole('radio', { name: /dots/i })).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('radio', { name: /square/i }).click();
    await expect(page.getByRole('radio', { name: /square/i })).toHaveAttribute('aria-checked', 'true');
  });

  test('enables gradient and controls direction', async ({ page }) => {
    const gradCheckbox = page.getByLabel(/enable module gradient/i);
    await gradCheckbox.check();

    await expect(page.locator('#grad-color-hex')).toBeVisible();
    await page.getByRole('radio', { name: /horizontal/i }).click();
    await expect(page.getByRole('radio', { name: /horizontal/i })).toHaveClass(/dir-active/);
  });

  test('updates error correction level', async ({ page }) => {
    await page.getByRole('radio', { name: /high/i }).click();
    await expect(page.getByRole('radio', { name: /high/i })).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.qr-badge-spec')).toContainText('H');
  });

  test('executes scan safety quick remedy action', async ({ page }) => {
    await page.locator('#fg-color-hex').fill('#777777');
    await page.locator('#bg-color-hex').fill('#888888');

    const remedyBtn = page.getByRole('button', { name: /apply high contrast/i });
    await expect(remedyBtn).toBeVisible();
    await remedyBtn.click();

    await expect(page.locator('.toast-notification')).toContainText('High contrast monochrome restored');
  });
});
