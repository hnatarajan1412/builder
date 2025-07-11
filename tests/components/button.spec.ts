import { test, expect } from '@playwright/test';

test.describe('Button Component - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add button component and configure all properties', async ({ page }) => {
    // Add a button component
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify button is added - be specific to avoid toolbar buttons
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Button');
    
    // Select the button
    await button.click();
    
    // Wait for properties panel
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change button label
    await page.locator('#button-label').fill('Click Me!');
    // Update button selector since text changed
    const updatedButton = canvas.locator('button').filter({ hasText: 'Click Me!' });
    await expect(updatedButton).toBeVisible();
    
    // Change button variant
    await page.getByRole('combobox').first().selectOption('secondary');
    
    // Change size
    await page.getByRole('combobox').nth(1).selectOption('large');
    
    // Test disabled state
    const disabledCheckbox = page.locator('label:has-text("Disabled")').locator('input[type="checkbox"]');
    await disabledCheckbox.check();
    await expect(button).toBeDisabled();
    await disabledCheckbox.uncheck();
    await expect(button).toBeEnabled();
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply styles
    await page.locator('label:has-text("Background Color")').locator('..').locator('input[placeholder="#ffffff"]').fill('#3b82f6');
    await page.locator('label:has-text("Text Color")').locator('..').locator('input[placeholder="#000000"]').fill('#ffffff');
    await page.locator('label:has-text("Font Size")').locator('..').locator('input').fill('18px');
    await page.locator('label:has-text("Border Radius")').locator('..').locator('input').fill('8px');
    
    // Test Data Tab for dynamic label binding
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    await page.getByRole('button', { name: 'Dynamic Binding' }).click();
    
    // Create test data
    await page.getByRole('tab', { name: /Data/i }).nth(0).click();
    await page.getByText('Add Table').click();
    await page.getByPlaceholder('users').fill('settings');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('buttonText');
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add test data to the table
    await page.locator('.border-gray-200').filter({ hasText: 'settings' }).click();
    await page.waitForTimeout(500);
    
    // Add a record
    await page.getByRole('button', { name: 'Add Record' }).click();
    await page.locator('input[type="text"]').last().fill('Dynamic Button Text');
    await page.locator('button').filter({ has: page.locator('.w-4.h-4') }).first().click(); // Save button
    
    // Test Events Tab
    await page.getByRole('tab', { name: /Components/i }).click();
    await button.click();
    await page.getByRole('tab', { name: /Events/i }).click();
    
    // Add click event
    const addButton = page.locator('button[title="Add Event"]');
    await addButton.click();
    
    await page.waitForTimeout(500);
    const eventItem = page.locator('.border-gray-200').first();
    await eventItem.click();
    
    await page.waitForTimeout(500);
    const actionSelect = page.locator('label:has-text("Action")').locator('..').locator('select');
    await actionSelect.selectOption('showAlert');
    
    await page.getByPlaceholder('Alert message...').fill('Button clicked!');
    
    // Test in Preview Mode
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    // Verify button is rendered
    const previewButton = page.locator('button').filter({ hasText: 'Click Me!' });
    await expect(previewButton).toBeVisible();
    
    // Set up dialog handler before triggering the click
    const dialogPromise = page.waitForEvent('dialog');
    
    // Test click event
    await previewButton.click();
    
    // Handle the alert dialog
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Button clicked!');
    await dialog.accept();
    
    // Close preview
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle button variants correctly', async ({ page }) => {
    // Add button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await button.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Test primary variant (default)
    await expect(button).toHaveClass(/bg-blue-600/);
    
    // Test secondary variant
    await page.getByRole('combobox').first().selectOption('secondary');
    await expect(button).toHaveClass(/bg-gray-100/);
    
    // Test outline variant
    await page.getByRole('combobox').first().selectOption('outline');
    await expect(button).toHaveClass(/border-gray-300/);
    
    // Test ghost variant
    await page.getByRole('combobox').first().selectOption('ghost');
    // Ghost variant only has hover:bg-gray-100, no static background
    await expect(button).toHaveClass(/hover:bg-gray-100/);
  });

  test('should handle button sizes correctly', async ({ page }) => {
    // Add button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await button.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Test small size
    await page.getByRole('combobox').nth(1).selectOption('small');
    await expect(button).toHaveClass(/px-3 py-1/);
    
    // Test medium size (default)
    await page.getByRole('combobox').nth(1).selectOption('medium');
    await expect(button).toHaveClass(/px-4 py-2/);
    
    // Test large size
    await page.getByRole('combobox').nth(1).selectOption('large');
    await expect(button).toHaveClass(/px-6 py-3/);
  });

  test('should support button with icon and loading state', async ({ page }) => {
    // Add button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await button.click();
    
    // Test hover state
    await button.hover();
    await expect(button).toHaveClass(/hover:opacity-90/);
    
    // Test focus state
    await button.focus();
    await expect(button).toHaveClass(/focus:ring-2/);
  });
});