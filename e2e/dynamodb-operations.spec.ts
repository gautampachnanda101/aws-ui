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

    // Fill table details
    await page.fill('input[placeholder="Table name"]', tableName);
    await page.fill('input[placeholder="Primary key name"]', 'id');

    // Click create table button
    await page.getByRole('button', { name: /create table/i }).click();

    // Verify table appears in list
    await expect(page.getByText(tableName)).toBeVisible({ timeout: 15000 });
  });

  test('should view DynamoDB table items', async ({ page }) => {
    const tableName = `TestViewTable${Date.now()}`;

    // Create table
    await page.fill('input[placeholder="Table name"]', tableName);
    await page.fill('input[placeholder="Primary key name"]', 'id');
    await page.getByRole('button', { name: /create table/i }).click();
    await expect(page.getByText(tableName)).toBeVisible({ timeout: 15000 });

    // Click to view table
    await page.getByText(tableName).click();

    // Should show items section (look for "Items" heading or "No items found" text)
    await expect(page.locator('h2:has-text("Items")')).toBeVisible({ timeout: 10000 });
  });
});
