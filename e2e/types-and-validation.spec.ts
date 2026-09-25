import { test, expect } from '@playwright/test';

test.describe('QR Types & Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('validates URL inputs and updates payload inspector', async ({ page }) => {
    const urlInput = page.locator('#url-input');
    await expect(urlInput).toBeVisible();

    await urlInput.fill('https://example.org');
    await page.getByRole('button', { name: /payload inspector/i }).click();
    await expect(page.locator('.raw-payload-code')).toContainText('https://example.org');

    await urlInput.fill('invalid-url-with-no-dot');
    await expect(page.locator('.field-error-msg')).toBeVisible();
    await expect(page.locator('.field-error-msg')).toContainText('valid domain name');

    await urlInput.fill('');
    await expect(page.locator('.field-error-msg')).toContainText('Destination URL is required');
  });

  test('validates Plain Text inputs and character constraints', async ({ page }) => {
    await page.getByRole('tab', { name: /text/i }).click();
    const textInput = page.locator('#text-input');
    await expect(textInput).toBeVisible();

    await textInput.fill('Hello Antigravity QR');
    await page.getByRole('button', { name: /payload inspector/i }).click();
    await expect(page.locator('.raw-payload-code')).toContainText('Hello Antigravity QR');

    await textInput.fill('');
    await expect(page.locator('.field-error-msg')).toContainText('Text content cannot be empty');
  });

  test('validates Email inputs with subject and body', async ({ page }) => {
    await page.getByRole('tab', { name: /email/i }).click();
    const emailInput = page.locator('#email-address-input');
    const subjectInput = page.locator('#email-subject-input');
    const messageInput = page.locator('#email-message-input');

    await emailInput.fill('hello@domain.com');
    await subjectInput.fill('Project Status');
    await messageInput.fill('All checks completed successfully.');

    await page.getByRole('button', { name: /payload inspector/i }).click();
    await expect(page.locator('.raw-payload-code')).toContainText('mailto:hello@domain.com?subject=Project%20Status&body=All%20checks%20completed%20successfully.');

    await emailInput.fill('invalid-email-address');
    await expect(page.locator('.field-error-msg')).toContainText('valid email address');
  });

  test('validates Phone inputs with international and local formats', async ({ page }) => {
    await page.getByRole('tab', { name: /phone/i }).click();
    const phoneInput = page.locator('#phone-input');

    await phoneInput.fill('+1 555 867 5309');
    await page.getByRole('button', { name: /payload inspector/i }).click();
    await expect(page.locator('.raw-payload-code')).toContainText('tel:+15558675309');

    await phoneInput.fill('123');
    await expect(page.locator('.field-error-msg')).toContainText('at least 5 digits');

    await phoneInput.fill('+1-555-888-CALL-NOW');
    await expect(page.locator('.field-error-msg')).toContainText('invalid characters');
  });

  test('validates Wi-Fi network configurations for WPA and Open security', async ({ page }) => {
    await page.getByRole('tab', { name: /wi-fi/i }).click();
    const ssidInput = page.locator('#wifi-ssid-input');
    const passInput = page.locator('#wifi-password-input');

    await ssidInput.fill('StudioGuest');
    await passInput.fill('short');
    await expect(page.locator('.field-error-msg')).toContainText('at least 8 characters');

    await passInput.fill('securepass123');
    await page.getByRole('button', { name: /payload inspector/i }).click();
    await expect(page.locator('.raw-payload-code')).toContainText('WIFI:S:StudioGuest;T:WPA;P:securepass123;;');

    await page.getByRole('radio', { name: /none \(open\)/i }).click();
    await expect(passInput).not.toBeVisible();
    await expect(page.locator('.raw-payload-code')).toContainText('WIFI:S:StudioGuest;T:nopass;;');
  });
});
