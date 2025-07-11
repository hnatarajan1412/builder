import { test, expect } from '@playwright/test';

test.describe('Binding Smoke Test', () => {
  test('should load app and check for console errors', async ({ page }) => {
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the app
    await page.goto('http://localhost:3003');
    
    // Wait for app to load
    await page.waitForTimeout(2000);
    
    // Check for any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);
    
    // Basic smoke test - check if main elements exist
    await expect(page.locator('text=No-Code Builder')).toBeVisible();
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Test App');
    await page.getByPlaceholder('Enter app description').fill('Test Description');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Test App');
    
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Click on the component to select it
    await page.locator('.builder-canvas').locator('text=Text').click();
    
    // Check if property panel opens
    await expect(page.locator('text=Properties')).toBeVisible();
    
    // Check if tabs exist
    await expect(page.getByRole('tab', { name: 'Props' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Style' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Data' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Events' })).toBeVisible();
    
    // Click on Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Check if dynamic binding UI is visible
    await expect(page.getByText('Static Values')).toBeVisible();
    await expect(page.getByText('Dynamic Binding')).toBeVisible();
    
    console.log('Smoke test passed!');
  });
});