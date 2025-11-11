import { test, expect } from '@playwright/test';

test.describe('SQS Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sqs');
    await page.waitForSelector('h1:has-text("SQS")');
  });

  test('should display SQS page with queue list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('SQS');
    await expect(page.getByRole('button', { name: /create/i })).toBeVisible();
  });

  test('should create a new SQS queue', async ({ page }) => {
    const queueName = `test-e2e-queue-${Date.now()}`;

    // Fill queue name
    await page.fill('input[placeholder="Queue name"]', queueName);

    // Click create button
    await page.getByRole('button', { name: /create/i }).click();

    // Verify queue appears in list
    await expect(page.getByText(queueName)).toBeVisible({ timeout: 10000 });
  });

  test('should send and receive messages from SQS queue', async ({ page }) => {
    const queueName = `test-msg-queue-${Date.now()}`;
    const messageBody = `Test message at ${Date.now()}`;

    // Create queue
    await page.fill('input[placeholder="Queue name"]', queueName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(queueName)).toBeVisible({ timeout: 10000 });

    // Select queue
    await page.getByText(queueName).first().click();

    // Wait for message area to load
    await expect(page.locator('textarea[placeholder="Message body"]')).toBeVisible();

    // Send message
    await page.fill('textarea[placeholder="Message body"]', messageBody);
    await page.getByRole('button', { name: /send/i }).click();

    // Wait a moment for message to be sent and fields to clear
    await page.waitForTimeout(2000);

    // Receive messages
    await page.getByRole('button', { name: /receive messages/i }).click();

    // Wait for messages to load
    await page.waitForTimeout(2000);

    // Verify message appears
    await expect(page.locator(`pre:has-text("${messageBody}")`)).toBeVisible({ timeout: 10000 });
  });

  test('should delete an SQS queue', async ({ page }) => {
    const queueName = `test-delete-queue-${Date.now()}`;

    // Create queue
    await page.fill('input[placeholder="Queue name"]', queueName);
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(queueName)).toBeVisible({ timeout: 10000 });

    // Set up dialog handler
    page.once('dialog', dialog => dialog.accept());

    // Delete queue - get the specific queue row and click its delete button
    await page.locator(`div:has-text("${queueName}")`).getByRole('button').last().click();

    // Verify queue is removed
    await expect(page.getByText(queueName)).not.toBeVisible({ timeout: 10000 });
  });
});
