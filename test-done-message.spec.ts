import { test, expect } from '@playwright/test';

test('Done button shows confirmation message', async ({ page }) => {
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Error]: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[Page Error]: ${error.message}`);
  });
  
  // Navigate to the app
  await page.goto('http://localhost:5173/');
  
  // Wait for page to load
  await page.waitForSelector('text=Invoice Presenter', { timeout: 10000 });
  
  // Wait a bit for React to render
  await page.waitForTimeout(2000);
  
  // Find the Done button - try multiple selectors
  let doneButton = page.locator('[data-testid="done-button"]');
  let count = await doneButton.count();
  
  if (count === 0) {
    // Fallback to any button with "Done" text
    doneButton = page.locator('button:has-text("Done")');
    count = await doneButton.count();
  }
  
  if (count === 0) {
    // Check what's actually on the page
    const html = await page.content();
    console.log('Page HTML (first 500 chars):', html.substring(0, 500));
    throw new Error('Done button not found on page');
  }
  
  await expect(doneButton).toBeVisible({ timeout: 10000 });
  
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
