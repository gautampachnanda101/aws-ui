import { test, expect } from '@playwright/test';

test.describe('SNS Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sns');
    await page.waitForSelector('h1:has-text("SNS")');
  });

  test('should display SNS page with topic list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SNS');
    await expect(page.getByRole('button', { name: /create/i }).first()).toBeVisible();
  });

  test('should create a new SNS topic', async ({ page }) => {
    const topicName = `test-e2e-topic-${Date.now()}`;

    // Fill topic name
    await page.fill('input[placeholder="Topic name"]', topicName);

    // Click create button
    await page.getByRole('button', { name: /create/i }).first().click();

    // Verify topic appears in list
    await expect(page.getByText(topicName)).toBeVisible({ timeout: 10000 });
  });

  test('should publish message to SNS topic', async ({ page }) => {
    const topicName = `test-pub-topic-${Date.now()}`;
    const messageText = `Test message at ${Date.now()}`;
    const messageSubject = 'Test Subject';

    // Create topic
    await page.fill('input[placeholder="Topic name"]', topicName);
    await page.getByRole('button', { name: /create/i }).first().click();
    await expect(page.getByText(topicName)).toBeVisible({ timeout: 10000 });

    // Select topic
    await page.getByText(topicName).first().click();

    // Wait for topic details to load
    await expect(page.locator('input[placeholder*="Subject"]')).toBeVisible({ timeout: 5000 });

    // Fill subject and message
    await page.fill('input[placeholder*="Subject"]', messageSubject);
    await page.fill('textarea[placeholder="Message"]', messageText);

    // Publish message
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for publish to complete
    await page.waitForTimeout(2000);

    // Verify message fields are cleared (indicates success)
    await expect(page.locator('input[placeholder*="Subject"]')).toHaveValue('');
    await expect(page.locator('textarea[placeholder="Message"]')).toHaveValue('');
  });

  test('should create subscription to SNS topic', async ({ page }) => {
    const topicName = `test-sub-topic-${Date.now()}`;
    const endpoint = `test-${Date.now()}@example.com`;

    // Create topic
    await page.fill('input[placeholder="Topic name"]', topicName);
    await page.getByRole('button', { name: /create/i }).first().click();
    await expect(page.getByText(topicName)).toBeVisible({ timeout: 10000 });

    // Select topic
    await page.getByText(topicName).first().click();

    // Wait for subscriptions section to load
    await expect(page.locator('select')).toBeVisible({ timeout: 5000 });

    // Create subscription
    await page.selectOption('select', 'email');
    await page.fill('input[placeholder="Endpoint"]', endpoint);
    await page.getByRole('button', { name: /add subscription/i }).click();

    // Verify subscription appears
    await expect(page.getByText(endpoint)).toBeVisible({ timeout: 10000 });
  });

  test('should delete an SNS topic', async ({ page }) => {
    const topicName = `test-delete-topic-${Date.now()}`;

    // Create topic
    await page.fill('input[placeholder="Topic name"]', topicName);
    await page.getByRole('button', { name: /create/i }).first().click();
    await expect(page.getByText(topicName)).toBeVisible({ timeout: 10000 });

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Delete topic - get the specific topic row and click its delete button
    await page.locator(`div:has-text("${topicName}")`).getByRole('button').last().click();

    // Verify topic is removed
    await expect(page.getByText(topicName)).not.toBeVisible({ timeout: 10000 });
  });
});
