import { test, expect } from '@playwright/test';

test.describe('History & Template Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('saves item to history and restores it back into editor', async ({ page }) => {
    await page.getByRole('tab', { name: /text/i }).click();
    await page.locator('#text-input').fill('Persistence Verification Test');

    await page.waitForTimeout(2000);

    const historyItem = page.locator('.tape-item', { hasText: 'Persistence Verification Test' });
    await expect(historyItem).toBeVisible();

    await page.getByRole('tab', { name: /url/i }).click();
    await historyItem.click();

    await expect(page.locator('#text-input')).toHaveValue('Persistence Verification Test');
  });

  test('pins and unpins history items', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/item-to-pin');
    await page.waitForTimeout(2000);

    const pinBtn = page.locator('.btn-tape-action').first();
    await pinBtn.click();

    await expect(page.locator('.tape-item', { hasText: 'example.com/item-to-pin' })).toHaveClass(/item-pinned/);
  });

  test('renames history item with custom label', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/rename-target');
    await page.waitForTimeout(2000);

    const renameBtn = page.getByRole('button', { name: /rename code/i }).first();
    await renameBtn.click();

    const renameInput = page.locator('.rename-inline-input');
    await renameInput.fill('Personal Portfolio');
    await page.locator('.btn-inline-save').click();

    await expect(page.locator('.tape-item', { hasText: 'Personal Portfolio' })).toBeVisible();
  });

  test('saves, applies, and deletes a custom template', async ({ page }) => {
    await page.locator('#fg-color-hex').fill('#064E3B');
    await page.getByRole('radio', { name: /rounded/i }).click();

    const tmplInput = page.locator('.template-name-field');
    await tmplInput.fill('Emerald Round');
    await page.getByRole('button', { name: /save style/i }).click();

    const tmplCard = page.locator('.template-card', { hasText: 'Emerald Round' });
    await expect(tmplCard).toBeVisible();

    await page.getByRole('button', { name: /classic/i }).click();
    await expect(page.locator('#fg-color-hex')).toHaveValue('#0F172A');

    await tmplCard.locator('.template-card-main').click();
    await expect(page.locator('#fg-color-hex')).toHaveValue('#064E3B');

    await tmplCard.locator('.btn-template-del').click();
    await expect(tmplCard).not.toBeVisible();
  });
});
