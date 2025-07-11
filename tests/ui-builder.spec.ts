import { test, expect } from '@playwright/test';

test.describe('No-Code UI Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Mock initial app data BEFORE navigation
    await page.addInitScript(() => {
      // Mock localStorage with test app data
      const testApp = {
        id: 'test-app-1',
        name: 'Test App',
        pages: ['page-1'],
        components: [],
        tables: []
      };
      
      const testPage = {
        id: 'page-1',
        appId: 'test-app-1',
        name: 'Home',
        path: '/',
        components: []
      };
      
      localStorage.setItem('currentApp', JSON.stringify(testApp));
      localStorage.setItem('currentPage', JSON.stringify(testPage));
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display main layout components', async ({ page }) => {
    // Header
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('No-Code Builder')).toBeVisible();
    
    // Sidebar
    await expect(page.locator('aside').first()).toBeVisible();
    await expect(page.getByRole('tab', { name: /Components/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Pages/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Data/i })).toBeVisible();
    
    // Canvas
    await expect(page.locator('[data-testid="canvas-drop-zone"]')).toBeVisible();
  });

  test('should switch between sidebar tabs', async ({ page }) => {
    // Click Pages tab
    await page.getByRole('tab', { name: /Pages/i }).click();
    await expect(page.getByRole('heading', { name: 'Pages' })).toBeVisible();
    await expect(page.getByText('Add Page')).toBeVisible();
    
    // Click Data tab
    await page.getByRole('tab', { name: /Data/i }).click();
    await expect(page.getByRole('heading', { name: 'Tables' })).toBeVisible();
    await expect(page.getByText('Add Table')).toBeVisible();
    
    // Go back to Components
    await page.getByRole('tab', { name: /Components/i }).click();
    await expect(page.getByText('Basic')).toBeVisible();
  });

  test('should drag and drop a button component', async ({ page }) => {
    // Find the button component in palette
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Drag and drop
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify button was added to canvas
    await expect(canvas.locator('button')).toBeVisible();
    await expect(canvas.locator('button')).toHaveText('Button');
  });

  test('should drag and drop multiple components', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Drag text component
    const textTile = page.locator('.component-tile').filter({ hasText: /^Text/ }).first();
    await textTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Drag input component
    const inputTile = page.locator('.component-tile').filter({ hasText: 'Input' });
    await inputTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Verify both components are on canvas
    await expect(canvas.locator('p')).toBeVisible();
    await expect(canvas.locator('input')).toBeVisible();
  });

  test('should select component and show properties panel', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Click the button to select it
    await canvas.locator('button').click();
    
    // Properties panel should appear
    await expect(page.locator('aside').filter({ hasText: 'Properties' })).toBeVisible();
    await expect(page.getByText('Component Properties')).toBeVisible();
    await expect(page.getByLabel('Button Label')).toBeVisible();
  });

  test('should edit component properties', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Select the button
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await button.click();
    
    // Edit button label
    const labelInput = page.getByLabel('Button Label');
    await labelInput.fill('Click Me!');
    
    // Verify button text updated
    await expect(canvas.locator('button').filter({ hasText: 'Click Me!' })).toBeVisible();
  });

  test.skip('should drag container and nest components', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Drag container
    const containerTile = page.locator('.component-tile').filter({ hasText: 'Container' });
    await containerTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Wait for container to appear
    const container = canvas.locator('[data-component-type="container"]');
    await expect(container).toBeVisible();
    
    // Drag button into container
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await container.hover();
    await page.mouse.up();
    
    // Verify button is inside container
    await expect(container.locator('button')).toBeVisible();
  });

  test('should delete component', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Select the button
    const button = canvas.locator('button').filter({ hasText: 'Button' });
    await button.click();
    
    // Hover to show toolbar
    await button.hover();
    
    // Click delete button
    await page.locator('[title="Delete"]').click();
    
    // Verify button is removed
    await expect(canvas.locator('button').filter({ hasText: 'Button' })).not.toBeVisible();
  });

  test.skip('should switch between style tabs in properties panel', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add and select a component
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    await canvas.locator('button').click();
    
    // Switch to Style tab
    await page.getByRole('tab', { name: /Style/i }).click();
    await expect(page.getByText('Background Color')).toBeVisible();
    
    // Find the properties panel and switch to Data tab
    const propertiesPanel = page.locator('aside').last();
    await propertiesPanel.getByRole('tab', { name: /Data/i }).click();
    await expect(page.getByText('Bindable Properties')).toBeVisible();
    
    // Switch to Events tab
    await propertiesPanel.getByRole('tab', { name: /Events/i }).click();
    await expect(page.getByText('Event Handlers')).toBeVisible();
  });

  test.skip('should save and generate code', async ({ page }) => {
    // Add some components
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Click Generate button
    await page.getByRole('button', { name: /Generate/i }).click();
    
    // Should show success message or modal
    await expect(page.getByText(/Generated successfully/i)).toBeVisible();
  });

  test('should handle viewport switching', async ({ page }) => {
    // Check viewport controls are visible
    await expect(page.getByText('Viewport:')).toBeVisible();
    
    // Click tablet view
    await page.getByRole('button', { name: 'Tablet' }).click();
    await expect(page.getByText('768px × 1024px')).toBeVisible();
    
    // Click mobile view
    await page.getByRole('button', { name: 'Mobile' }).click();
    await expect(page.getByText('375px × 667px')).toBeVisible();
    
    // Back to desktop
    await page.getByRole('button', { name: 'Desktop' }).click();
    await expect(page.getByText('1280px × 800px')).toBeVisible();
    
    // Full width
    await page.getByRole('button', { name: 'Full Width' }).click();
    await expect(page.getByText('375px × 667px')).not.toBeVisible();
  });

  test.skip('should create new page', async ({ page }) => {
    // Go to Pages tab
    await page.getByRole('tab', { name: /Pages/i }).click();
    
    // Click Add Page
    await page.getByText('+ Add Page').click();
    
    // Fill in page details (assuming modal appears)
    await page.getByLabel('Page Name').fill('About');
    await page.getByLabel('Path').fill('/about');
    await page.getByRole('button', { name: /Create/i }).click();
    
    // Verify new page appears
    await expect(page.getByText('About')).toBeVisible();
  });

  test.skip('should undo/redo actions', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add a button
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.hover();
    await page.mouse.down();
    await canvas.hover();
    await page.mouse.up();
    
    // Should see the button
    await expect(canvas.locator('button:has-text("Button")')).toBeVisible();
    
    // Wait a bit for the history to be saved
    await page.waitForTimeout(1000);
    
    // Click undo button
    await page.locator('[title*="Undo"]').click();
    await expect(canvas.locator('button:has-text("Button")')).not.toBeVisible();
    
    // Click redo button
    await page.locator('[title*="Redo"]').click();
    await expect(canvas.locator('button:has-text("Button")')).toBeVisible();
  });
});