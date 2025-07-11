import { test, expect } from '@playwright/test';

test.describe('App Persistence', () => {
  test('should persist apps after page refresh', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Persistent App');
    await page.getByPlaceholder('Enter app description').fill('Testing persistence');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Persistent App');
    
    // Refresh the page
    await page.reload();
    
    // App should still be there
    await expect(page.getByRole('button', { name: 'Persistent App' })).toBeVisible();
  });

  test('should persist page components after refresh', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // First create the app if it doesn't exist
    const hasApp = await page.getByRole('button', { name: 'Persistent App' }).count() > 0;
    if (!hasApp) {
      await page.getByRole('button', { name: 'Create New App' }).click();
      await page.getByPlaceholder('Enter app name').fill('Persistent App');
      await page.getByPlaceholder('Enter app description').fill('Testing persistence');
      await page.getByRole('button', { name: 'Create App' }).click();
      await page.waitForSelector('text=Persistent App');
    }
    
    // Navigate to the app's dashboard page
    // First switch to Pages tab
    await page.getByRole('tab', { name: 'Pages' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: 'Dashboard' }).click();
    
    // Add components
    // Switch back to Components tab
    await page.getByRole('tab', { name: 'Components' }).click();
    await page.waitForTimeout(500);
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    await page.locator('.builder-canvas p').click();
    await page.locator('input[type="text"]').first().clear();
    await page.locator('input[type="text"]').first().fill('Persistent Component');
    
    // Refresh the page
    await page.reload();
    
    // Navigate back to the app
    await page.getByRole('tab', { name: 'Pages' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: 'Dashboard' }).click();
    
    // Component should still be there
    await expect(page.locator('.builder-canvas').getByText('Persistent Component')).toBeVisible();
  });

  test('should persist table schemas', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // First create the app if it doesn't exist
    const hasApp = await page.getByRole('button', { name: 'Persistent App' }).count() > 0;
    if (!hasApp) {
      await page.getByRole('button', { name: 'Create New App' }).click();
      await page.getByPlaceholder('Enter app name').fill('Persistent App');
      await page.getByPlaceholder('Enter app description').fill('Testing persistence');
      await page.getByRole('button', { name: 'Create App' }).click();
      await page.waitForSelector('text=Persistent App');
    }
    
    // Go to Data tab
    await page.getByRole('button', { name: 'Data' }).click();
    
    // Create a table
    await page.getByRole('button', { name: 'Add Table' }).click();
    await page.getByPlaceholder('Enter table name').fill('persistent_table');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add a field
    await page.getByRole('button', { name: 'Add Field' }).click();
    await page.getByPlaceholder('Field name').fill('test_field');
    await page.selectOption('select', 'text');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Refresh the page
    await page.reload();
    
    // Navigate back to data
    await page.getByRole('button', { name: 'Data' }).click();
    
    // Table and field should still be there
    await expect(page.getByText('persistent_table')).toBeVisible();
    await expect(page.getByText('test_field')).toBeVisible();
  });
});