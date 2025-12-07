import { test, expect } from '@playwright/test';

test('Done button shows confirmation message', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173/');
  
  // Wait for page to load
  await page.waitForSelector('text=Invoice Presenter');
  
  // Find the Done button
  const doneButton = page.locator('[data-testid="done-button"]');
  await expect(doneButton).toBeVisible();
  
  // Click the button
  await doneButton.click();
  
  // Wait for Alert to appear
  const alert = page.locator('[data-testid="done-message-alert"]');
  await expect(alert).toBeVisible({ timeout: 5000 });
  
  // Check that alert contains "Done!" and a message
  const alertText = await alert.textContent();
  expect(alertText).toContain('Done!');
  expect(alertText?.length).toBeGreaterThan(10);
  
  // Wait for alert to disappear after 5 seconds
  await page.waitForTimeout(6000);
  await expect(alert).not.toBeVisible();
});
