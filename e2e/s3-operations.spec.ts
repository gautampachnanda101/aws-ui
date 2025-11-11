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

    // Fill bucket name in the input field
    await page.fill('input[placeholder="Bucket name"]', bucketName);

    // Click create bucket button
    await page.getByRole('button', { name: /create/i }).click();

    // Verify bucket appears in list
    await expect(page.getByText(bucketName)).toBeVisible({ timeout: 10000 });
  });

  test('should delete an S3 bucket', async ({ page }) => {
    const bucketName = `test-delete-bucket-${Date.now()}`;

    // Create bucket first
    await page.fill('input[placeholder="Bucket name"]', bucketName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(bucketName)).toBeVisible({ timeout: 10000 });

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => dialog.accept());

    // Delete the bucket - find the parent container and get the delete button
    const bucketRow = page.locator(`div:has-text("${bucketName}")`).filter({ hasText: new RegExp(`^${bucketName}$`) });
    await bucketRow.getByRole('button').click();

    // Verify bucket is removed
    await expect(page.getByText(bucketName)).not.toBeVisible({ timeout: 10000 });
  });
});
