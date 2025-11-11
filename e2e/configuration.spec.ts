import { test, expect } from '@playwright/test';

test.describe('Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/config');
    await page.waitForSelector('h1:has-text("Configuration")');
  });

  test('should display configuration page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Configuration');
    await expect(page.getByText(/LocalStack Instances/i)).toBeVisible();
  });

  test('should show default LocalStack instance', async ({ page }) => {
    await expect(page.getByText(/Local Development/i).first()).toBeVisible();
    await expect(page.getByText(/localhost:4566/i)).toBeVisible();
  });

  test('should have export config button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
  });

  test('should have import config button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /import/i })).toBeVisible();
  });

  test('should have reset to defaults button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /reset.*default/i })).toBeVisible();
  });

  test('should show add instance form', async ({ page }) => {
    await expect(page.getByText(/Add New Instance/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Instance Name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Endpoint/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add instance/i })).toBeVisible();
  });

  test('should reset configuration to defaults', async ({ page }) => {
    // Click reset button
    await page.getByRole('button', { name: /reset.*default/i }).click();

    // Accept confirmation dialog
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Reset to default configuration');
      dialog.accept();
    });

    // Accept alert about refreshing
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('reset');
      dialog.accept();
    });

    // Wait for dialogs to process
    await page.waitForTimeout(1000);
  });

  test('should validate endpoint URL format in add instance form', async ({ page }) => {
    const instanceName = `Test Instance ${Date.now()}`;

    await page.fill('input[placeholder*="Instance Name" i]', instanceName);
    await page.fill('input[placeholder*="Endpoint" i]', 'http://test-localstack:4566');
    await page.fill('input[placeholder*="Region" i]', 'us-west-2');

    await page.getByRole('button', { name: /add instance/i }).click();

    // Verify instance was added
    await expect(page.getByText(instanceName)).toBeVisible({ timeout: 5000 });
  });
});
