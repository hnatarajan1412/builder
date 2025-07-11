import { test, expect } from '@playwright/test';

test.describe('Image Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add and configure image component', async ({ page }) => {
    // Add image component
    const imageTile = page.locator('.component-tile').filter({ hasText: 'Image' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await imageTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify image is added
    const image = canvas.locator('img');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200');
    
    // Select the image
    await image.click();
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change image source
    await page.locator('input[placeholder="Image URL..."]').fill('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba');
    
    // Change alt text
    await page.locator('input[placeholder="Alternative text..."]').fill('Beautiful landscape');
    await expect(image).toHaveAttribute('alt', 'Beautiful landscape');
    
    // Change object fit
    await page.getByRole('combobox').selectOption('contain');
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Set dimensions
    await page.locator('label:has-text("Width")').locator('..').locator('input').fill('400px');
    await page.locator('label:has-text("Height")').locator('..').locator('input').fill('300px');
    await page.locator('label:has-text("Border Radius")').locator('..').locator('input').fill('8px');
    
    // Test in Preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewImage = page.locator('img');
    await expect(previewImage).toBeVisible();
    await expect(previewImage).toHaveAttribute('alt', 'Beautiful landscape');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});

test.describe('Container Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should add container and nest components', async ({ page }) => {
    // Add container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await containerTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify container is added
    const container = canvas.locator('div').filter({ hasText: 'Drop components here' });
    await expect(container).toBeVisible();
    
    // Select the container
    await container.click();
    await page.waitForTimeout(1000);
    
    // Test Props Tab
    await page.getByRole('tab', { name: /Props/i }).click();
    
    // Change layout type
    await page.getByRole('combobox').selectOption('horizontal');
    
    // Change gap
    await page.locator('input[type="number"]').fill('24');
    
    // Test Style Tab
    await page.getByRole('tab', { name: /Style/i }).click();
    
    // Apply styles
    await page.locator('label:has-text("Background Color")').locator('..').locator('input[placeholder="#ffffff"]').fill('#f3f4f6');
    await page.locator('label:has-text("Padding")').locator('..').locator('input[placeholder="All"]').fill('20');
    await page.locator('label:has-text("Border Radius")').locator('..').locator('input').fill('12px');
    
    // Add components to container
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    // Add first button
    await buttonTile.hover();
    await page.mouse.down();
    await container.hover();
    await page.mouse.up();
    
    // Add second button
    await buttonTile.hover();
    await page.mouse.down();
    await container.hover();
    await page.mouse.up();
    
    // Verify buttons are inside container
    const buttons = container.locator('button');
    await expect(buttons).toHaveCount(2);
    
    // Test in Preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewContainer = page.locator('div').filter({ has: page.locator('button') }).first();
    await expect(previewContainer).toHaveCSS('background-color', 'rgb(243, 244, 246)');
    await expect(previewContainer).toHaveCSS('padding', '20px');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});

test.describe('Form Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should create form with inputs and handle submission', async ({ page }) => {
    // Add form
    const formTile = page.locator('.component-tile').filter({ hasText: 'Form' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await formTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify form is added
    const form = canvas.locator('form');
    await expect(form).toBeVisible();
    
    // Add input field to form
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    await inputTile.hover();
    await page.mouse.down();
    await form.hover();
    await page.mouse.up();
    
    // Add button to form
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await form.hover();
    await page.mouse.up();
    
    // Configure button as submit
    const submitButton = form.locator('button');
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('tab', { name: /Props/i }).click();
    await page.locator('#button-label').fill('Submit');
    
    // Configure form submit event
    await form.click();
    await page.getByRole('tab', { name: /Events/i }).click();
    
    const addButton = page.locator('button[title="Add Event"]');
    await addButton.click();
    
    await page.waitForTimeout(500);
    const eventItem = page.locator('.border-gray-200').first();
    await eventItem.click();
    
    await page.waitForTimeout(500);
    const eventSelect = page.locator('label:has-text("Event Type")').locator('..').locator('select');
    await eventSelect.selectOption('onSubmit');
    
    const actionSelect = page.locator('label:has-text("Action")').locator('..').locator('select');
    await actionSelect.selectOption('showAlert');
    
    await page.getByPlaceholder('Alert message...').fill('Form submitted!');
    
    // Test in Preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    const previewForm = page.locator('form');
    const previewInput = previewForm.locator('input');
    const previewButton = previewForm.locator('button');
    
    // Fill form
    await previewInput.fill('test@example.com');
    
    // Set up dialog handler
    const dialogPromise = page.waitForEvent('dialog');
    
    // Submit form
    await previewButton.click();
    
    // Handle alert
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Form submitted!');
    await dialog.accept();
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});

test.describe('Data Binding Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
  });

  test('should bind table data to components', async ({ page }) => {
    // Create a table with test data
    await page.getByRole('tab', { name: /Data/i }).click();
    await page.getByText('Add Table').click();
    await page.getByPlaceholder('users').fill('products');
    
    // Add fields
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(1).fill('name');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(2).fill('price');
    await page.locator('select').nth(2).selectOption('number');
    
    await page.getByText('Add Field').click();
    await page.locator('input[placeholder="Field name"]').nth(3).fill('inStock');
    await page.locator('select').nth(3).selectOption('boolean');
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Add data to table
    await page.locator('.border-gray-200').filter({ hasText: 'products' }).click();
    await page.waitForTimeout(500);
    
    // Add products
    await page.getByRole('button', { name: 'Add Record' }).click();
    await page.locator('input[type="text"]').nth(1).fill('Laptop');
    await page.locator('input[type="number"]').fill('999.99');
    await page.locator('input[type="checkbox"]').check();
    await page.locator('button').filter({ has: page.locator('.w-4.h-4') }).first().click();
    
    await page.getByRole('button', { name: 'Add Record' }).click();
    await page.locator('input[type="text"]').nth(1).fill('Mouse');
    await page.locator('input[type="number"]').fill('29.99');
    await page.locator('button').filter({ has: page.locator('.w-4.h-4') }).first().click();
    
    // Go to components and add table
    await page.getByRole('tab', { name: /Components/i }).click();
    
    const tableTile = page.locator('.component-tile').filter({ hasText: 'Table' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    await tableTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Bind table to products data
    const table = canvas.locator('table');
    await table.click();
    
    await page.getByRole('tab', { name: /Data/i }).nth(1).click();
    await page.getByRole('button', { name: 'Dynamic Binding' }).click();
    await page.getByText('products').click();
    
    // Verify binding indicator
    await expect(page.locator('text=Bound')).toBeVisible();
    
    // Test in Preview
    await page.getByText('Preview').click();
    await page.waitForTimeout(1000);
    
    // Verify data is displayed
    const previewTable = page.locator('table');
    await expect(previewTable).toBeVisible();
    await expect(previewTable).toContainText('Laptop');
    await expect(previewTable).toContainText('999.99');
    await expect(previewTable).toContainText('Mouse');
    await expect(previewTable).toContainText('29.99');
    
    await page.getByRole('button', { name: 'Close' }).click();
  });
});