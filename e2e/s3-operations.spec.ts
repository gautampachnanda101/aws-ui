import { test, expect } from '@playwright/test';

test.describe('S3 Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/s3');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("S3")');
  });

  test('should display S3 page with bucket list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('S3');
    // Should have a way to create buckets
    await expect(page.getByRole('button', { name: /create|new/i })).toBeVisible();
  });

  test('should create a new S3 bucket', async ({ page }) => {
    const bucketName = `test-e2e-bucket-${Date.now()}`;

    // Click create bucket button
    await page.getByRole('button', { name: /create|new/i }).first().click();

    // Fill bucket name
    await page.fill('input[name="bucketName"], input[placeholder*="bucket" i]', bucketName);

    // Submit form
    await page.getByRole('button', { name: /create|save/i }).click();

    // Verify bucket appears in list
    await expect(page.getByText(bucketName)).toBeVisible({ timeout: 10000 });
  });

  test('should delete an S3 bucket', async ({ page }) => {
    const bucketName = `test-delete-bucket-${Date.now()}`;

    // Create bucket first
    await page.getByRole('button', { name: /create|new/i }).first().click();
    await page.fill('input[name="bucketName"], input[placeholder*="bucket" i]', bucketName);
    await page.getByRole('button', { name: /create|save/i }).click();
    await expect(page.getByText(bucketName)).toBeVisible({ timeout: 10000 });

    // Delete the bucket
    await page.locator(`text=${bucketName}`).locator('..').getByRole('button', { name: /delete/i }).click();

    // Confirm deletion
    page.once('dialog', dialog => dialog.accept());

    // Verify bucket is removed
    await expect(page.getByText(bucketName)).not.toBeVisible({ timeout: 10000 });
  });
});
