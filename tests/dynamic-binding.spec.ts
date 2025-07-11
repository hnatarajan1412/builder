import { test, expect } from '@playwright/test';

test.describe('Dynamic Data Binding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // Create a new app
    await page.getByRole('button', { name: 'Create New App' }).click();
    await page.getByPlaceholder('Enter app name').fill('Data Binding Test App');
    await page.getByPlaceholder('Enter app description').fill('Testing dynamic data binding');
    await page.getByRole('button', { name: 'Create App' }).click();
    
    // Wait for app creation
    await page.waitForSelector('text=Data Binding Test App');
    
    // Navigate to a page
    await page.getByText('Dashboard').click();
  });

  test('should show Data tab with dynamic binding editor', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Click on the component to select it
    await page.locator('.builder-canvas').locator('text=Text').click();
    
    // Switch to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Verify dynamic binding UI is shown
    await expect(page.getByText('Static Values')).toBeVisible();
    await expect(page.getByText('Dynamic Binding')).toBeVisible();
    
    // Verify bindable properties are shown
    await expect(page.getByText('Bindable Properties')).toBeVisible();
    await expect(page.getByText('Text Content')).toBeVisible();
  });

  test('should switch between static and dynamic binding modes', async ({ page }) => {
    // Add a button component
    await page.locator('[data-component-id="button"]').dragTo(page.locator('.builder-canvas'));
    
    // Select the button
    await page.locator('.builder-canvas').locator('button').click();
    
    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Should be in static mode by default
    await expect(page.getByText('Button Label')).toBeVisible();
    
    // Switch to dynamic binding
    await page.getByText('Dynamic Binding').click();
    
    // Should show binding expression editor
    await expect(page.getByText('Bindable Properties')).toBeVisible();
    await expect(page.getByText('Binding Expression')).toBeVisible();
    await expect(page.getByText('Data Sources')).toBeVisible();
  });

  test('should show data source explorer with categories', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Select it
    await page.locator('.builder-canvas').locator('text=Text').click();
    
    // Go to Data tab and switch to dynamic binding
    await page.getByRole('tab', { name: 'Data' }).click();
    await page.getByText('Dynamic Binding').click();
    
    // Check data source categories
    await expect(page.getByText('App State')).toBeVisible();
    await expect(page.getByText('User')).toBeVisible();
    await expect(page.getByText('System')).toBeVisible();
  });

  test('should allow clicking data sources to create binding', async ({ page }) => {
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Select it
    await page.locator('.builder-canvas').locator('text=Text').click();
    
    // Go to Data tab and switch to dynamic binding
    await page.getByRole('tab', { name: 'Data' }).click();
    await page.getByText('Dynamic Binding').click();
    
    // Expand User category
    await page.getByText('User').click();
    
    // Click on Logged In User > Name
    await page.getByText('Logged In User').click();
    await page.getByText('Name').first().click();
    
    // Verify expression is created
    await expect(page.locator('textarea')).toHaveValue('{{user.name}}');
  });

  test('should provide auto-complete in expression input', async ({ page }) => {
    // Add an input component
    await page.locator('[data-component-id="input"]').dragTo(page.locator('.builder-canvas'));
    
    // Select it
    await page.locator('.builder-canvas').locator('input').click();
    
    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Should show multiple bindable properties
    await expect(page.getByText('Value')).toBeVisible();
    await expect(page.getByText('Placeholder')).toBeVisible();
    await expect(page.getByText('Disabled')).toBeVisible();
    
    // Switch placeholder to dynamic binding
    await page.locator('[data-property="placeholder"]').locator('text=Dynamic Binding').click();
    
    // Type in expression input to trigger auto-complete
    await page.locator('[data-property="placeholder"]').locator('input[placeholder="Click to bind..."]').click();
    await page.keyboard.type('{{use');
    
    // Should show auto-complete suggestions
    await expect(page.getByText('user')).toBeVisible();
  });

  test('should show search in data source explorer', async ({ page }) => {
    // Add a component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    await page.locator('.builder-canvas').locator('text=Text').click();
    
    // Go to Data tab and switch to dynamic
    await page.getByRole('tab', { name: 'Data' }).click();
    await page.getByText('Dynamic Binding').click();
    
    // Search for "name"
    await page.getByPlaceholder('Search data sources...').fill('name');
    
    // Should filter results
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Email')).not.toBeVisible();
  });

  test('should preserve bindings when switching tabs', async ({ page }) => {
    // Add a button
    await page.locator('[data-component-id="button"]').dragTo(page.locator('.builder-canvas'));
    await page.locator('.builder-canvas').locator('button').click();
    
    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Set up dynamic binding
    await page.getByText('Dynamic Binding').click();
    await page.locator('textarea').fill('{{user.name}}');
    
    // Switch to Props tab
    await page.getByRole('tab', { name: 'Props' }).click();
    
    // Switch back to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Binding should still be there
    await expect(page.locator('textarea')).toHaveValue('{{user.name}}');
  });

  test('should support boolean property binding', async ({ page }) => {
    // Add a button
    await page.locator('[data-component-id="button"]').dragTo(page.locator('.builder-canvas'));
    await page.locator('.builder-canvas').locator('button').click();
    
    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Find the Disabled property
    await expect(page.getByText('Disabled')).toBeVisible();
    
    // Switch disabled to dynamic
    const disabledSection = page.locator('[data-property="disabled"]');
    await disabledSection.locator('text=Dynamic Binding').click();
    
    // Set expression
    await disabledSection.locator('textarea').fill('{{user.role !== "admin"}}');
    
    // Preview - button should be enabled for admin users
    await page.getByRole('button', { name: 'Preview' }).click();
    
    const previewButton = page.locator('.preview-mode button');
    await expect(previewButton).not.toBeDisabled(); // Since default user is admin
  });
});