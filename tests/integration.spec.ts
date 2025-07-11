import { test, expect } from '@playwright/test';

test.describe('Backend Integration', () => {
  const API_URL = 'http://localhost:3001/api/mcp/tools';
  let testAppId: string;

  test.beforeEach(async ({ page }) => {
    // Create a test app via API
    const response = await page.request.post(API_URL, {
      data: {
        tool: 'createApp',
        parameters: {
          name: 'UI Builder Test App',
          description: 'Created for integration testing'
        }
      }
    });
    
    const { result } = await response.json();
    testAppId = result.id;
    
    // Navigate to builder
    await page.goto('/');
  });

  test('should load apps from backend', async ({ page }) => {
    // Click on app selector
    await page.getByText('Select App').click();
    
    // Should show the test app
    await expect(page.getByText('UI Builder Test App')).toBeVisible();
    
    // Select the app
    await page.getByText('UI Builder Test App').click();
    
    // App should be loaded
    await expect(page.getByText('App: UI Builder Test App')).toBeVisible();
  });

  test('should create and save page to backend', async ({ page }) => {
    // Load the app first
    await page.evaluate((appId) => {
      localStorage.setItem('currentAppId', appId);
    }, testAppId);
    
    await page.reload();
    
    // Go to Pages tab
    await page.getByRole('tab', { name: /Pages/i }).click();
    
    // Create new page
    await page.getByText('+ Add Page').click();
    await page.getByLabel('Page Name').fill('Dashboard');
    await page.getByLabel('Path').fill('/dashboard');
    await page.getByRole('button', { name: /Create/i }).click();
    
    // Verify via API
    const pagesResponse = await page.request.get(`${API_URL}?tool=getApp&appId=${testAppId}`);
    const appData = await pagesResponse.json();
    
    expect(appData.pages).toContain('Dashboard');
  });

  test('should save component changes to backend', async ({ page }) => {
    // Set up app and page
    await page.evaluate((appId) => {
      localStorage.setItem('currentAppId', appId);
      localStorage.setItem('currentPageId', 'test-page');
    }, testAppId);
    
    // Create a page via API first
    await page.request.post(API_URL, {
      data: {
        tool: 'createPage',
        parameters: {
          appId: testAppId,
          name: 'Test Page',
          path: '/test'
        }
      }
    });
    
    await page.reload();
    
    // Add a button component
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    
    // Edit button properties
    const button = canvas.locator('button');
    await button.click();
    await page.getByLabel('Button Label').fill('Save Data');
    
    // Save the page
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for save confirmation
    await expect(page.getByText(/Saved successfully/i)).toBeVisible();
    
    // Verify the component was saved
    // Reload and check if button persists
    await page.reload();
    await expect(canvas.locator('button')).toHaveText('Save Data');
  });

  test('should generate code and create preview', async ({ page }) => {
    // Set up app with components
    await page.evaluate((appId) => {
      localStorage.setItem('currentAppId', appId);
    }, testAppId);
    
    // Create page and add components via UI
    await page.goto('/');
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add components
    await page.locator('.component-tile').filter({ hasText: 'Container' }).dragTo(canvas);
    await page.locator('.component-tile').filter({ hasText: 'Text' }).dragTo(
      canvas.locator('[data-component-type="container"]')
    );
    await page.locator('.component-tile').filter({ hasText: 'Button' }).dragTo(
      canvas.locator('[data-component-type="container"]')
    );
    
    // Click Generate button
    await page.getByRole('button', { name: /Generate/i }).click();
    
    // Should show generation progress
    await expect(page.getByText(/Generating/i)).toBeVisible();
    
    // Should complete
    await expect(page.getByText(/Generated successfully/i)).toBeVisible({ timeout: 30000 });
    
    // Should show preview link
    const previewLink = page.getByRole('link', { name: /View Preview/i });
    await expect(previewLink).toBeVisible();
    
    // Click preview link
    const [previewPage] = await Promise.all([
      page.context().waitForEvent('page'),
      previewLink.click()
    ]);
    
    // Preview should contain our components
    await expect(previewPage.locator('button')).toBeVisible();
    await expect(previewPage.locator('p')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock API failure
    await page.route('**/api/mcp/tools', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Try to create a component
    const canvas = page.locator('[data-testid="canvas-drop-zone"]');
    const buttonTile = page.locator('.component-tile').filter({ hasText: 'Button' });
    await buttonTile.dragTo(canvas);
    
    // Try to save
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Should show error message
    await expect(page.getByText(/Error saving/i)).toBeVisible();
  });

  test('should sync state across multiple tabs', async ({ page, context }) => {
    // Set up first tab
    await page.evaluate((appId) => {
      localStorage.setItem('currentAppId', appId);
    }, testAppId);
    
    await page.goto('/');
    const canvas1 = page.locator('[data-testid="canvas-drop-zone"]');
    
    // Add button in first tab
    await page.locator('.component-tile').filter({ hasText: 'Button' }).dragTo(canvas1);
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText(/Saved successfully/i)).toBeVisible();
    
    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/');
    await page2.evaluate((appId) => {
      localStorage.setItem('currentAppId', appId);
    }, testAppId);
    await page2.reload();
    
    // Second tab should show the button
    const canvas2 = page2.locator('[data-testid="canvas-drop-zone"]');
    await expect(canvas2.locator('button')).toBeVisible();
    
    // Edit in second tab
    await canvas2.locator('button').click();
    await page2.getByLabel('Button Label').fill('Updated Button');
    await page2.getByRole('button', { name: /Save/i }).click();
    
    // Refresh first tab
    await page.reload();
    
    // First tab should show updated button
    await expect(canvas1.locator('button')).toHaveText('Updated Button');
  });

  test.afterEach(async ({ page }) => {
    // Clean up test app
    if (testAppId) {
      await page.request.post(API_URL, {
        data: {
          tool: 'deleteApp',
          parameters: { appId: testAppId }
        }
      });
    }
  });
});