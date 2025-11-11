import { test, expect } from '@playwright/test';

test.describe('Lambda Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lambda');
    await page.waitForSelector('h1:has-text("Lambda")');
  });

  test('should display Lambda page with function list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Lambda');
    await expect(page.getByRole('button', { name: /create/i })).toBeVisible();
  });

  test('should create a new Lambda function', async ({ page }) => {
    const functionName = `test-e2e-function-${Date.now()}`;

    // Fill function name
    await page.fill('input[placeholder="Function name"]', functionName);

    // Click create button
    await page.getByRole('button', { name: /create/i }).click();

    // Verify function appears in list (Lambda creation can be slow)
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 30000 });
  });

  test('should invoke a Lambda function', async ({ page }) => {
    const functionName = `test-invoke-func-${Date.now()}`;
    const payload = '{"test": "data"}';

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 30000 });

    // Select function
    await page.getByText(functionName).first().click();

    // Wait for function details to load
    await expect(page.locator('strong:has-text("ARN")')).toBeVisible({ timeout: 10000 });

    // Fill payload
    await page.fill('textarea[placeholder*="key"]', payload);

    // Invoke function
    await page.getByRole('button', { name: /play/i }).click();

    // Verify result appears
    await expect(page.locator('h4:has-text("Result")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('pre')).toContainText('Status');
  });

  test('should view Lambda function details', async ({ page }) => {
    const functionName = `test-details-func-${Date.now()}`;

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 30000 });

    // Select function
    await page.getByText(functionName).first().click();

    // Verify details are shown
    await expect(page.locator('strong:has-text("ARN")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('strong:has-text("Runtime")')).toBeVisible();
    await expect(page.locator('strong:has-text("Handler")')).toBeVisible();
    await expect(page.getByText('nodejs18.x')).toBeVisible();
  });

  test('should delete a Lambda function', async ({ page }) => {
    const functionName = `test-delete-func-${Date.now()}`;

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 30000 });

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Delete function - get the specific function row and click its delete button
    await page.locator(`div:has-text("${functionName}")`).getByRole('button').last().click();

    // Verify function is removed
    await expect(page.getByText(functionName)).not.toBeVisible({ timeout: 10000 });
  });
});
