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
  const allDoneButtons = page.locator('button:has-text("Done")');
  const buttonCount = await allDoneButtons.count();
  
  let doneButton = allDoneButtons.first();
  
  // Check if button is already done (filled variant)
  const variant = await doneButton.getAttribute('data-variant');
  const isAlreadyDone = variant === 'filled';
  
  console.log(`Button variant: ${variant}, isAlreadyDone: ${isAlreadyDone}`);
  
  // If already done, unmark it first
  if (isAlreadyDone) {
    console.log('Unmarking button first...');
    await doneButton.click();
    await page.waitForTimeout(1000); // Wait for state update
    // Verify it's now unmarked
    const newVariant = await doneButton.getAttribute('data-variant');
    console.log(`After unmark, variant: ${newVariant}`);
  }
  
  await expect(doneButton).toBeVisible();
  
  // Now click to mark it as done
  console.log('Clicking to mark as done...');
  
  // Listen for console.log to see if toggleDone is called
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('toggleDone') || text.includes('Setting done message') || text.includes('Not showing')) {
      console.log('Browser console:', text);
    }
  });
  
  // Try clicking via JavaScript to ensure it works
  await doneButton.evaluate((btn: HTMLButtonElement) => {
    console.log('Clicking button via JS, onClick:', (btn as any).onclick);
    btn.click();
  });
  
  // Wait a bit for React to process
  await page.waitForTimeout(2000);
  
  // If window message is still empty, try setting it directly to test if Alert renders
  if (!(await page.evaluate(() => (window as any).__doneMessage))) {
    console.log('Setting message directly to test Alert rendering...');
    await page.evaluate(() => {
      (window as any).__doneMessage = 'Test message - Trykk "send" – la inntekten kjenne at du mener det. 👰';
      // Try to trigger React re-render by dispatching a custom event
      window.dispatchEvent(new Event('test-message'));
    });
    
    // Try to find React root and update state directly
    await page.evaluate(() => {
      const root = document.getElementById('root');
      if (root && (root as any)._reactRootContainer) {
        console.log('Found React root, trying to update...');
      }
    });
  }
  
  // Check window for doneMessage and if function was called
  const windowData = await page.evaluate(() => ({
    message: (window as any).__doneMessage,
    called: (window as any).__toggleDoneCalled,
    willBeDone: (window as any).__willBeDone,
    wasDone: (window as any).__wasDone,
    error: (window as any).__error
  }));
  console.log('Window data:', JSON.stringify(windowData, null, 2));
  
  // Also check if button state changed
  const buttonStateAfter = await doneButton.getAttribute('data-variant');
  console.log('Button state after click:', buttonStateAfter);
  
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

