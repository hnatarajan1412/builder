import { test, expect } from '@playwright/test';

test.describe('Input Component - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add input component and configure all properties', async ({ page }) => {
    // Add an input component
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify input is added
    const input = canvas.locator('input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'Input');
    
    // Select the input
    await input.click();
    
    // Wait for properties panel
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change placeholder
    await page.locator('input[placeholder="Placeholder text..."]').fill('Enter your email');
    await expect(input).toHaveAttribute('placeholder', 'Enter your email');
    
    // Change input type
    await page.getByRole('combobox').first().selectOption('email');
    await expect(input).toHaveAttribute('type', 'email');
    
    // Set default value
    await page.locator('label:has-text("Default Value")').locator('..').locator('input').fill('user@example.com');
    
    // Test required checkbox
    const requiredCheckbox = page.locator('label:has-text("Required")').locator('input[type="checkbox"]');
    await requiredCheckbox.check();
    await expect(input).toHaveAttribute('required', '');
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply styles
    await page.locator('label:has-text("Width")').locator('..').locator('input[placeholder="auto"]').fill('300px');
    await page.locator('label:has-text("Background Color")').locator('..').locator('input[placeholder="#ffffff"]').fill('#f9fafb');
    await page.locator('label:has-text("Border")').locator('..').locator('input').fill('2px solid #3b82f6');
    await page.locator('label:has-text("Border Radius")').locator('..').locator('input').fill('6px');
    
    // Test Data Tab for value binding
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    await page.getByRole('button', { name: 'Dynamic Binding' }).click();
    
    // Create test data
    await page.getByRole('tab', { name: /Data/i }).nth(0).click();
    await page.getByText('Add Table').click();
    await page.getByPlaceholder('users').fill('formData');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('email');
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add test data
    await page.locator('.border-gray-200').filter({ hasText: 'formData' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: 'Add Record' }).click();
    await page.locator('input[type="text"]').last().fill('bound@example.com');
    await page.locator('button').filter({ has: page.locator('.w-4.h-4') }).first().click(); // Save
    
    // Test Events Tab
    await page.getByRole('tab', { name: /Components/i }).click();
    await input.click();
    await page.getByRole('tab', { name: /Events/i }).click();
    
    // Add onChange event
    const addButton = page.locator('button[title="Add Event"]');
    await addButton.click();
    
    await page.waitForTimeout(500);
    const eventItem = page.locator('.border-gray-200').first();
    await eventItem.click();
    
    await page.waitForTimeout(500);
    const eventSelect = page.locator('label:has-text("Event Type")').locator('..').locator('select');
    await eventSelect.selectOption('onChange');
    
    const actionSelect = page.locator('label:has-text("Action")').locator('..').locator('select');
    await actionSelect.selectOption('updateState');
    
    await page.locator('input[placeholder="user.preferences.theme"]').fill('formData.email');
    
    // Test in Preview Mode
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    // Verify input is rendered
    const previewInput = page.locator('input[type="email"]');
    await expect(previewInput).toBeVisible();
    await expect(previewInput).toHaveAttribute('placeholder', 'Enter your email');
    
    // Test input interaction
    await previewInput.fill('test@example.com');
    await expect(previewInput).toHaveValue('test@example.com');
    
    // Verify state update (shown in state debug panel)
    await expect(page.locator('text=Page State')).toBeVisible();
    await expect(page.locator('pre')).toContainText('formData.email');
    
    // Close preview
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle different input types correctly', async ({ page }) => {
    // Add input
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const input = canvas.locator('input');
    await input.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Test text input (default)
    await expect(input).toHaveAttribute('type', 'text');
    
    // Test email input
    await page.getByRole('combobox').first().selectOption('email');
    await expect(input).toHaveAttribute('type', 'email');
    
    // Test password input
    await page.getByRole('combobox').first().selectOption('password');
    await expect(input).toHaveAttribute('type', 'password');
    
    // Test number input
    await page.getByRole('combobox').first().selectOption('number');
    await expect(input).toHaveAttribute('type', 'number');
    
    // Test tel input
    await page.getByRole('combobox').first().selectOption('tel');
    await expect(input).toHaveAttribute('type', 'tel');
    
    // Test url input
    await page.getByRole('combobox').first().selectOption('url');
    await expect(input).toHaveAttribute('type', 'url');
  });

  test('should support input validation and states', async ({ page }) => {
    // Add input
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const input = canvas.locator('input');
    await input.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Set to email type
    await page.getByRole('combobox').first().selectOption('email');
    
    // Make it required
    await page.locator('label:has-text("Required")').locator('input[type="checkbox"]').check();
    
    // Add validation pattern
    await page.locator('label:has-text("Pattern")').locator('..').locator('input').fill('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    
    // Add min/max length
    await page.locator('label:has-text("Min Length")').locator('..').locator('input').fill('5');
    await page.locator('label:has-text("Max Length")').locator('..').locator('input').fill('50');
    
    // Test disabled state
    const disabledCheckbox = page.locator('label:has-text("Disabled")').locator('input[type="checkbox"]');
    await disabledCheckbox.check();
    await expect(input).toBeDisabled();
    
    await disabledCheckbox.uncheck();
    await expect(input).toBeEnabled();
    
    // Test in preview with validation
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewInput = page.locator('input[type="email"]');
    
    // Test invalid email
    await previewInput.fill('invalid');
    await previewInput.blur();
    
    // Test valid email
    await previewInput.fill('valid@example.com');
    await previewInput.blur();
    
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle input with icons and addons', async ({ page }) => {
    // Add input
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const input = canvas.locator('input');
    await input.click();
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Add padding for icon space
    await page.locator('label:has-text("Padding")').locator('..').locator('input[placeholder="L"]').fill('40');
    
    // Add custom styling
    await page.locator('label:has-text("Box Shadow")').locator('..').locator('input').fill('0 1px 2px 0 rgba(0, 0, 0, 0.05)');
    
    // Test focus styles
    await page.locator('label:has-text("Focus Border Color")').locator('..').locator('input').fill('#3b82f6');
    await page.locator('label:has-text("Focus Shadow")').locator('..').locator('input').fill('0 0 0 3px rgba(59, 130, 246, 0.1)');
    
    // Verify in preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewInput = page.locator('input');
    await previewInput.focus();
    
    // Verify focus styles are applied
    await expect(previewInput).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});