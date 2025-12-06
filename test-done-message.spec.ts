import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('Done button shows confirmation message', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173/');
  
  // Wait for page to load
  await page.waitForSelector('text=Invoice Presenter');
  
  // Create a test Excel file
  const testFile = join(__dirname, 'test.xlsx');
  
  // Upload the file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testFile);
  
  // Wait for table to appear
  await page.waitForSelector('table', { timeout: 10000 });
  
  // Find a "Done" button that is NOT already marked (outline variant, not filled)
  // First, check if any button is not done
  const allDoneButtons = page.locator('button:has-text("Done")');
  const buttonCount = await allDoneButtons.count();
  
  let doneButton;
  let buttonIndex = 0;
  
  // Find a button that's not already done (outline variant)
  for (let i = 0; i < buttonCount; i++) {
    const btn = allDoneButtons.nth(i);
    const variant = await btn.getAttribute('data-variant');
    if (variant === 'outline' || !variant) {
      doneButton = btn;
      buttonIndex = i;
      break;
    }
  }
  
  // If all are done, click one to unmark it first, then mark it again
  if (!doneButton) {
    doneButton = allDoneButtons.first();
    await doneButton.click(); // Unmark it
    await page.waitForTimeout(500); // Wait for state update
  }
  
  await expect(doneButton).toBeVisible();
  
  // Click the Done button to mark it as done
  await doneButton.click();
  
  // Wait for React to update - check multiple times with longer waits
  let alertFound = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(300);
    
    // Check HTML directly for message text
    const html = await page.content();
    const hasMessage = html.includes('Trykk') || html.includes('Hold') || html.includes('Få') || html.includes('Skru') || html.includes('Kort') || html.includes('Sånn');
    
    if (hasMessage) {
      alertFound = true;
      writeFileSync('.test-success.html', html);
      console.log(`✅ Alert found in HTML on attempt ${i + 1}`);
      break;
    }
    
    // Check for Alert component by class name (Mantine uses specific classes)
    const alertByClass = await page.locator('[class*="mantine-Alert"], [class*="Alert-root"]').count();
    if (alertByClass > 0) {
      const text = await page.locator('[class*="mantine-Alert"], [class*="Alert-root"]').first().textContent().catch(() => '');
      if (text && (text.includes('Trykk') || text.includes('Hold') || text.includes('Få') || text.includes('Done'))) {
        alertFound = true;
        console.log(`✅ Alert element found: ${text.substring(0, 50)}`);
        break;
      }
    }
    
    // Check for any element containing the message text
    const messageElements = await page.locator('text=/Trykk|Hold|Få|Skru|Kort|Sånn|Stram/').count();
    if (messageElements > 0) {
      alertFound = true;
      console.log(`✅ Message text found in DOM on attempt ${i + 1}`);
      break;
    }
  }
  
  // If still not found, save HTML for debugging
  if (!alertFound) {
    const html = await page.content();
    writeFileSync('.test-debug.html', html);
    console.log('❌ Alert not found - HTML saved to .test-debug.html');
  }
  
  // Write result to file
  const result = {
    alertFound,
    attempts: alertFound ? 1 : 20,
    timestamp: new Date().toISOString(),
    url: page.url()
  };
  
  writeFileSync('.test-result.json', JSON.stringify(result, null, 2));
  
  if (!alertFound) {
    // Take screenshot for debugging
    await page.screenshot({ path: '.test-failure.png', fullPage: true });
    
    // Get page HTML for analysis
    const html = await page.content();
    writeFileSync('.test-page.html', html);
    
    // Get console messages
    const consoleMessages = await page.evaluate(() => {
      return (window as any).__consoleMessages || [];
    });
    writeFileSync('.test-console.json', JSON.stringify(consoleMessages, null, 2));
  }
  
  expect(alertFound).toBe(true);
});

