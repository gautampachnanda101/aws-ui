import { test, expect } from '@playwright/test';

test.describe('Lambda Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lambda');
    await page.waitForSelector('h1:has-text("Lambda")');
  });

  test('should display Lambda page with function list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Lambda');
    await expect(page.getByRole('button', { name: /create function/i }).first()).toBeVisible();
  });

  test('should create a new Lambda function', async ({ page }) => {
    const functionName = `test-e2e-function-${Date.now()}`;

    // Fill function name
    await page.fill('input[placeholder="Function name"]', functionName);

    // Click create button
    await page.getByRole('button', { name: /create function/i }).click();

    // Verify function appears in list
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 10000 });
  });

  test('should invoke a Lambda function', async ({ page }) => {
    const functionName = `test-invoke-function-${Date.now()}`;

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create function/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 10000 });

    // Select function
    await page.getByText(functionName).first().click();

    // Wait for function details to load
    await expect(page.locator('textarea[placeholder*="key"]')).toBeVisible({ timeout: 5000 });

    // Wait for function to become active (Lambda functions are created asynchronously)
    // CI environments can be slower, so we use a longer timeout
    await page.waitForTimeout(8000);

    // Invoke function with default payload
    await page.getByRole('button', { name: /invoke/i }).click();

    // Wait for result with longer timeout
    await page.waitForTimeout(6000);

    // Verify result appears - check for the result container instead
    const resultHeading = page.getByRole('heading', { name: /result/i, level: 4 });
    await expect(resultHeading).toBeVisible({ timeout: 10000 });
  });

  test('should invoke Lambda function with custom payload', async ({ page }) => {
    const functionName = `test-payload-function-${Date.now()}`;
    const customPayload = JSON.stringify({ test: 'data', timestamp: Date.now() }, null, 2);

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create function/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 10000 });

    // Select function
    await page.getByText(functionName).first().click();

    // Wait for function details to load
    await expect(page.locator('textarea[placeholder*="key"]')).toBeVisible({ timeout: 5000 });

    // Wait for function to become active (Lambda functions are created asynchronously)
    // CI environments can be slower, so we use a longer timeout
    await page.waitForTimeout(8000);

    // Clear and fill custom payload
    await page.fill('textarea[placeholder*="key"]', customPayload);

    // Invoke function
    await page.getByRole('button', { name: /invoke/i }).click();

    // Wait for result
    await page.waitForTimeout(6000);

    // Verify result appears - check for the result heading
    const resultHeading = page.getByRole('heading', { name: /result/i, level: 4 });
    await expect(resultHeading).toBeVisible({ timeout: 10000 });
  });

  test('should delete a Lambda function', async ({ page }) => {
    const functionName = `test-delete-function-${Date.now()}`;

    // Create function
    await page.fill('input[placeholder="Function name"]', functionName);
    await page.getByRole('button', { name: /create function/i }).click();
    await expect(page.getByText(functionName)).toBeVisible({ timeout: 10000 });

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Delete function - get the specific function row and click its delete button
    await page.locator(`div:has-text("${functionName}")`).getByRole('button').last().click();

    // Verify function is removed
    await expect(page.getByText(functionName)).not.toBeVisible({ timeout: 10000 });
  });
});
