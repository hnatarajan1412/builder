import { test, expect } from '@playwright/test';

test.describe('List Component - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add list component and configure all properties', async ({ page }) => {
    // Add a list component
    const listTile = page.locator('.component-tile').filter({ hasText: 'List' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await listTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify list is added
    const list = canvas.locator('ul');
    await expect(list).toBeVisible();
    await expect(list.locator('li')).toHaveCount(3); // Default 3 items
    
    // Select the list
    await list.click();
    
    // Wait for properties panel
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change to ordered list
    await page.getByRole('combobox').selectOption('ordered');
    
    // Edit list items
    const itemsTextarea = page.locator('textarea');
    await itemsTextarea.clear();
    await itemsTextarea.fill('First item\nSecond item\nThird item\nFourth item');
    
    // Verify ordered list is applied
    await expect(canvas.locator('ul')).toHaveClass(/list-decimal/);
    await expect(canvas.locator('li')).toHaveCount(4);
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply styles
    await page.locator('label:has-text("Font Size")').locator('..').locator('input').fill('18px');
    await page.locator('label:has-text("Text Color")').locator('..').locator('input[type="text"]').fill('#333333');
    
    // Test Data Tab
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    
    // Switch to dynamic binding
    await page.getByRole('button', { name: 'Dynamic Binding' }).click();
    
    // Create a test table first
    await page.getByRole('tab', { name: /Data/i }).nth(0).click();
    await page.getByText('Add Table').click();
    await page.getByPlaceholder('users').fill('todos');
    
    // Add fields
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('title');
    await page.locator('input[placeholder="Field name"]').nth(1).press('Tab');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(2).fill('completed');
    await page.locator('select').nth(2).selectOption('boolean');
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Go back to components and bind data
    await page.getByRole('tab', { name: /Components/i }).click();
    await list.click();
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    
    // Click on the todos table to bind
    await page.getByText('todos').click();
    
    // Verify binding indicator appears
    await expect(page.locator('text=Bound')).toBeVisible();
    
    // Test Events Tab
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
    
    await page.getByPlaceholder('Alert message...').fill('List item clicked!');
    
    // Test in Preview Mode
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    // Verify list is rendered with mock data
    const previewList = page.locator('ul');
    await expect(previewList).toBeVisible();
    
    // Data bound list will show todo items
    await expect(previewList.locator('li')).toContainText(['title 1', 'title 2', 'title 3']);
    
    // Close preview
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle list type switching', async ({ page }) => {
    // Add list
    const listTile = page.locator('.component-tile').filter({ hasText: 'List' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await listTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const list = canvas.locator('ul');
    await list.click();
    
    // Default should be unordered
    await expect(list).toHaveClass(/list-disc/);
    
    // Switch to ordered
    await page.getByRole('tab', { name: /Props/i }).click();
    await page.getByRole('combobox').selectOption('ordered');
    
    // Verify switched to ordered list
    await expect(list).toHaveClass(/list-decimal/);
  });

  test('should support list styling', async ({ page }) => {
    // Add list
    const listTile = page.locator('.component-tile').filter({ hasText: 'List' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await listTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const list = canvas.locator('ul');
    await list.click();
    
    // Style the list
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply padding
    await page.locator('label:has-text("Padding")').locator('..').locator('input[placeholder="All"]').fill('20');
    
    // Apply margin
    await page.locator('label:has-text("Margin")').locator('..').locator('input[placeholder="All"]').fill('10');
    
    // Apply background color
    await page.locator('label:has-text("Background Color")').locator('..').locator('input[placeholder="#ffffff"]').fill('#f5f5f5');
    
    // Verify styles applied
    await expect(list).toHaveCSS('padding', '20px');
    await expect(list).toHaveCSS('margin', '10px');
    await expect(list).toHaveCSS('background-color', 'rgb(245, 245, 245)');
  });

  test('should handle list with custom items', async ({ page }) => {
    // Add list
    const listTile = page.locator('.component-tile').filter({ hasText: 'List' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await listTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    const list = canvas.locator('ul');
    await list.click();
    
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Add custom items
    const itemsTextarea = page.locator('textarea');
    await itemsTextarea.clear();
    await itemsTextarea.fill('Apple\nBanana\nCherry\nDate\nElderberry');
    
    // Verify items
    const items = list.locator('li');
    await expect(items).toHaveCount(5);
    await expect(items.nth(0)).toContainText('Apple');
    await expect(items.nth(4)).toContainText('Elderberry');
  });
});