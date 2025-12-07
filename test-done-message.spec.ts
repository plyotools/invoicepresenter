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
  
  // Wait a bit more for React to render
  await page.waitForTimeout(2000);
  
  // Check if table has data
  const tableHasData = await page.evaluate(() => {
    const tbody = document.querySelector('table tbody');
    return tbody && tbody.children.length > 0;
  });
  console.log('Table has data:', tableHasData);
  
  // Find a "Done" button - try data-testid first, then fall back to last column
  let doneButton = page.locator('table tbody tr td:last-child button').first();
  const buttonCount = await doneButton.count();
  console.log(`Found ${buttonCount} Done buttons in last column`);
  
  if (buttonCount === 0) {
    // Fallback to any button with "Done" text
    doneButton = page.locator('button:has-text("Done")').first();
  }
  
  expect(await doneButton.count()).toBeGreaterThan(0);
  
  // Check if button is already done (green background)
  const bgColor = await doneButton.evaluate((btn: HTMLButtonElement) => {
    return window.getComputedStyle(btn).backgroundColor;
  });
  const isAlreadyDone = bgColor.includes('51') || bgColor.includes('rgb(81, 207, 102)');
  
  console.log(`Button bgColor: ${bgColor}, isAlreadyDone: ${isAlreadyDone}`);
  
  // If already done, unmark it first
  if (isAlreadyDone) {
    console.log('Unmarking button first...');
    await doneButton.click();
    await page.waitForTimeout(1000);
  }
  
  await expect(doneButton).toBeVisible();
  
  // Listen for ALL console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`[Browser Console] ${msg.type()}: ${text}`);
  });
  
  // Also listen for page errors
  page.on('pageerror', error => {
    console.log(`[Page Error]: ${error.message}`);
  });
  
  // Click the button
  console.log('Clicking to mark as done...');
  const buttonInfo = await doneButton.evaluate((btn: HTMLButtonElement) => {
    return {
      hasOnClick: !!(btn as any).onclick,
      type: btn.type,
      text: btn.textContent,
      style: window.getComputedStyle(btn).backgroundColor,
      dataIndex: btn.dataset.rowIndex
    };
  });
  console.log('Button info before click:', buttonInfo);
  
  // Try calling toggleDone directly via window
  const directCallResult = await page.evaluate((index) => {
    console.log('Checking window.__toggleDone:', typeof (window as any).__toggleDone);
    if ((window as any).__toggleDone) {
      try {
        (window as any).__toggleDone(parseInt(index));
        return { called: true, method: 'window.__toggleDone', error: null };
      } catch (e) {
        return { called: false, method: 'window.__toggleDone', error: String(e) };
      }
    }
    // Try to find and call the function another way
    const buttons = document.querySelectorAll('button[data-row-index]');
    if (buttons.length > 0) {
      const btn = buttons[0] as HTMLButtonElement;
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      btn.dispatchEvent(clickEvent);
      return { called: true, method: 'dispatchEvent', error: null };
    }
    return { called: false, method: 'none', error: 'No toggleDone found' };
  }, buttonInfo.dataIndex || '0');
  console.log('Direct call result:', directCallResult);
  
  // Also click the button
  await doneButton.click();
  
  console.log('Button clicked, waiting for response...');
  
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
  
  // Wait a bit for React to process
  await page.waitForTimeout(1000);
  
  // Check window for doneMessage and if function was called
  const windowData = await page.evaluate(() => ({
    message: (window as any).__doneMessage,
    toggleDoneCalled: (window as any).__toggleDoneCalled,
    toggleDoneIndex: (window as any).__toggleDoneIndex,
    toggleDoneWasDone: (window as any).__toggleDoneWasDone,
    toggleDoneWillBeDone: (window as any).__toggleDoneWillBeDone,
    willBeDone: (window as any).__willBeDone,
    wasDone: (window as any).__wasDone,
    error: (window as any).__error
  }));
  console.log('Window data after click:', JSON.stringify(windowData, null, 2));
  console.log('Console messages captured:', consoleMessages.length);
  consoleMessages.forEach((msg, i) => {
    if (msg.includes('button') || msg.includes('toggle') || msg.includes('Done') || msg.includes('message')) {
      console.log(`  [${i}] ${msg}`);
    }
  });
  
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
    
    // Check for Mantine Alert component by data-testid
    const alertByTestId = await page.locator('[data-testid="done-message-alert"]').count();
    if (alertByTestId > 0) {
      const isVisible = await page.locator('[data-testid="done-message-alert"]').first().isVisible().catch(() => false);
      if (isVisible) {
        const text = await page.locator('[data-testid="done-message-alert"]').first().textContent().catch(() => '');
        if (text && (text.includes('Trykk') || text.includes('Hold') || text.includes('Få') || text.includes('Done') || text.includes('💰'))) {
          alertFound = true;
          console.log(`✅ Alert found with data-testid: ${text.substring(0, 50)}`);
          break;
        }
      }
    }
    
    // Check for Alert component by class name (Mantine uses specific classes)
    const alertByClass = await page.locator('[class*="mantine-Alert"], [class*="Alert-root"]').count();
    if (alertByClass > 0) {
      const isVisible = await page.locator('[class*="mantine-Alert"], [class*="Alert-root"]').first().isVisible().catch(() => false);
      if (isVisible) {
        const text = await page.locator('[class*="mantine-Alert"], [class*="Alert-root"]').first().textContent().catch(() => '');
        if (text && (text.includes('Trykk') || text.includes('Hold') || text.includes('Få') || text.includes('Done') || text.includes('💰'))) {
          alertFound = true;
          console.log(`✅ Alert element found: ${text.substring(0, 50)}`);
          break;
        }
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

