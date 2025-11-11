import { test, expect } from '@playwright/test';

test.describe('DynamoDB Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamodb');
    await page.waitForSelector('h1:has-text("DynamoDB")');
  });

  test('should display DynamoDB page with table list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('DynamoDB');
    await expect(page.getByRole('button', { name: /create|new/i })).toBeVisible();
  });

  test('should create a new DynamoDB table', async ({ page }) => {
    const tableName = `TestE2ETable${Date.now()}`;

    // Click create table button
    await page.getByRole('button', { name: /create|new/i }).first().click();

    // Fill table details
    await page.fill('input[name="tableName"], input[placeholder*="table" i]', tableName);
    await page.fill('input[name="partitionKey"], input[placeholder*="partition" i]', 'id');

    // Submit form
    await page.getByRole('button', { name: /create|save/i }).click();

    // Verify table appears in list
    await expect(page.getByText(tableName)).toBeVisible({ timeout: 15000 });
  });

  test('should view DynamoDB table items', async ({ page }) => {
    const tableName = `TestViewTable${Date.now()}`;

    // Create table
    await page.getByRole('button', { name: /create|new/i }).first().click();
    await page.fill('input[name="tableName"], input[placeholder*="table" i]', tableName);
    await page.fill('input[name="partitionKey"], input[placeholder*="partition" i]', 'id');
    await page.getByRole('button', { name: /create|save/i }).click();
    await expect(page.getByText(tableName)).toBeVisible({ timeout: 15000 });

    // Click to view table
    await page.getByText(tableName).click();

    // Should show items page (even if empty)
    await expect(page.locator('text=/items|data|records/i')).toBeVisible({ timeout: 10000 });
  });
});
