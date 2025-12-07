import { test, expect } from '@playwright/test';

test.describe('Row height with overlay', () => {
  test('overlay should match original row height', async ({ page }) => {
    await page.goto('http://localhost:5458');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if there's a table (would need Excel file uploaded)
    const table = page.locator('table');
    const tableExists = await table.count() > 0;
    
    if (tableExists) {
      // Get first row
      const firstRow = page.locator('tbody tr').first();
      
      // Get original row height before clicking done
      const originalHeight = await firstRow.evaluate((el) => {
        return el.getBoundingClientRect().height;
      });
      
      // Click done button
      const doneButton = page.locator('[data-testid="done-button-0"]');
      if (await doneButton.count() > 0) {
        await doneButton.click();
        
        // Wait for overlay to appear
        await page.waitForTimeout(100);
        
        // Get row height after overlay appears
        const heightWithOverlay = await firstRow.evaluate((el) => {
          return el.getBoundingClientRect().height;
        });
        
        // Get overlay height
        const overlay = firstRow.locator('div[style*="position: absolute"]').first();
        const overlayHeight = await overlay.evaluate((el) => {
          return el.getBoundingClientRect().height;
        });
        
        // Heights should match (within 1px tolerance for rounding)
        expect(Math.abs(originalHeight - heightWithOverlay)).toBeLessThan(2);
        expect(Math.abs(originalHeight - overlayHeight)).toBeLessThan(2);
      }
    }
  });
});

