import { test, expect } from '@playwright/test';

test.describe('UI Navigation', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LocalStack CRUD UI/);
  });

  test('should navigate to S3 page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=S3');
    await expect(page).toHaveURL(/.*s3/);
    await expect(page.locator('h1')).toContainText('S3');
  });

  test('should navigate to DynamoDB page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=DynamoDB');
    await expect(page).toHaveURL(/.*dynamodb/);
    await expect(page.locator('h1')).toContainText('DynamoDB');
  });

  test('should navigate to SQS page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=SQS');
    await expect(page).toHaveURL(/.*sqs/);
    await expect(page.locator('h1')).toContainText('SQS');
  });

  test('should navigate to SNS page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=SNS');
    await expect(page).toHaveURL(/.*sns/);
    await expect(page.locator('h1')).toContainText('SNS');
  });

  test('should navigate to Lambda page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Lambda');
    await expect(page).toHaveURL(/.*lambda/);
    await expect(page.locator('h1')).toContainText('Lambda');
  });

  test('should navigate to Configuration page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Configuration');
    await expect(page).toHaveURL(/.*config/);
    await expect(page.locator('h1')).toContainText('Configuration');
  });
});
