import { test, expect } from '@playwright/test';

test.describe('Data Binding Integration', () => {
  test('should successfully show and use dynamic binding in Data tab', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3003');
    
    // Create a new app if needed
    const hasApp = await page.locator('text=Test App').count() > 0;
    if (!hasApp) {
      await page.getByRole('button', { name: 'Create New App' }).click();
      await page.getByPlaceholder('Enter app name').fill('Test App');
      await page.getByPlaceholder('Enter app description').fill('Test Description');
      await page.getByRole('button', { name: 'Create App' }).click();
      
      // Wait for app creation
      await page.waitForSelector('text=Test App', { timeout: 5000 });
    }
    
    // Navigate to Dashboard page
    await page.getByText('Dashboard').click();
    
    // Add a text component
    await page.locator('[data-component-id="text"]').dragTo(page.locator('.builder-canvas'));
    
    // Wait a bit for the component to be added
    await page.waitForTimeout(500);
    
    // Click on the text component to select it
    const textComponent = page.locator('.builder-canvas').locator('p, h1, h2, h3, span').first();
    await textComponent.click();
    
    // Wait for properties panel
    await page.waitForSelector('text=Properties', { timeout: 5000 });
    
    // Click on Data tab
    const dataTab = page.getByRole('tab', { name: 'Data' });
    await expect(dataTab).toBeVisible();
    await dataTab.click();
    
    // Verify Data tab content is shown
    await expect(page.getByText('Static Values')).toBeVisible();
    await expect(page.getByText('Dynamic Binding')).toBeVisible();
    
    // Switch to Dynamic Binding
    await page.getByText('Dynamic Binding').click();
    
    // Verify dynamic binding UI elements
    await expect(page.getByText('Bindable Properties')).toBeVisible();
    await expect(page.getByText('Text Content')).toBeVisible();
    await expect(page.getByText('Binding Expression')).toBeVisible();
    await expect(page.getByText('Data Sources')).toBeVisible();
    
    // Check data source categories
    await expect(page.getByText('User')).toBeVisible();
    await expect(page.getByText('System')).toBeVisible();
    
    // Expand User category
    const userCategory = page.getByText('User').first();
    await userCategory.click();
    
    // Should show user options
    await expect(page.getByText('Logged In User')).toBeVisible();
    
    // Click on Logged In User to expand
    await page.getByText('Logged In User').click();
    
    // Click on Name to create binding
    await page.getByText('Name').first().click();
    
    // Verify binding expression is created
    const bindingTextarea = page.locator('textarea').first();
    await expect(bindingTextarea).toHaveValue('{{user.name}}');
    
    // Test expression input with auto-complete
    await bindingTextarea.clear();
    await bindingTextarea.type('{{use');
    
    // Should show autocomplete (might need to wait)
    await page.waitForTimeout(500);
    
    // Type the rest
    await bindingTextarea.fill('{{user.email}}');
    
    // Switch to Props tab and back to verify persistence
    await page.getByRole('tab', { name: 'Props' }).click();
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Should still have the binding
    await expect(bindingTextarea).toHaveValue('{{user.email}}');
    
    // Test with a button component
    await page.getByRole('tab', { name: 'Props' }).click(); // Go back to props to deselect
    
    // Add a button
    await page.locator('[data-component-id="button"]').dragTo(page.locator('.builder-canvas'));
    await page.waitForTimeout(500);
    
    // Select the button
    await page.locator('.builder-canvas').locator('button').last().click();
    
    // Go to Data tab
    await page.getByRole('tab', { name: 'Data' }).click();
    
    // Should show button properties
    await expect(page.getByText('Button Label')).toBeVisible();
    await expect(page.getByText('Disabled')).toBeVisible();
    
    // Test boolean binding
    const disabledSection = page.locator('text=Disabled').locator('..');
    await disabledSection.locator('text=Dynamic Binding').click();
    
    // Should show binding options for disabled property
    await expect(disabledSection.locator('textarea')).toBeVisible();
    
    console.log('Data binding integration test completed successfully!');
  });
});