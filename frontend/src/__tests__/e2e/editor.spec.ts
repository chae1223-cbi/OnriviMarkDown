import { test, expect } from '@playwright/test';

test.describe('Onrivi Author E2E', () => {
  test('should load the editor page and display title', async ({ page }) => {
    await page.goto('/');
    // Check if the page title is correct or if the main editor area loads
    await expect(page).toHaveTitle(/온리비 어서/);
  });
});
