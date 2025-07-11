import { test, expect, Page } from '@playwright/test';

// Helper to wait for app to load
async function waitForApp(page: Page) {
  await page.waitForSelector('[data-testid="canvas-drop-zone"]', { timeout: 30000 });
}

// Helper to create a simple test setup
async function setupSimpleTest(page: Page) {
  // Wait for canvas to be ready
  await waitForApp(page);
  
  // Create products table using console (simpler approach)
  await page.evaluate(() => {
    // Access the database service directly
    const databaseService = (window as any).databaseService;
    if (databaseService) {
      const appId = 'test-app';
      
      // Create table
      databaseService.createTable(appId, {
        id: 'products',
        name: 'products',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'price', type: 'number' },
          { name: 'category', type: 'text' }
        ]
      });
      
      // Add test data
      const products = [
        { id: '1', name: 'iPhone 14', price: 999, category: 'Electronics' },
        { id: '2', name: 'MacBook Pro', price: 2499, category: 'Computers' },
        { id: '3', name: 'AirPods', price: 249, category: 'Audio' }
      ];
      
      products.forEach(product => {
        databaseService.insertData(appId, 'products', product);
      });
    }
  });
}

test.describe('Preview Mode - Table and Repeater', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupSimpleTest(page);
  });

  test('table displays data with magic text in preview mode', async ({ page }) => {
    // Add table component via console
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        const tableComponent = {
          id: 'table-1',
          componentId: 'table',
          props: {
            data: '{{products}}',
            columns: [
              { field: 'name', label: 'Product' },
              { field: 'price', label: 'Price', format: 'currency' },
              { field: 'category', label: 'Category' }
            ],
            striped: true
          }
        };
        builderStore.addComponentToPage(tableComponent);
      }
    });
    
    // Click preview button
    await page.click('button:has-text("Preview")');
    
    // Wait for table to render
    await page.waitForSelector('table', { timeout: 5000 });
    
    // Verify table has data
    await expect(page.locator('text=iPhone 14')).toBeVisible();
    await expect(page.locator('text=MacBook Pro')).toBeVisible();
    await expect(page.locator('text=AirPods')).toBeVisible();
    
    // Verify currency formatting
    await expect(page.locator('text=$999.00')).toBeVisible();
    await expect(page.locator('text=$2,499.00')).toBeVisible();
  });

  test('repeater renders items with magic text in preview mode', async ({ page }) => {
    // Add repeater with text component
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        const repeaterComponent = {
          id: 'repeater-1',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'vertical',
            spacing: 8
          },
          children: [
            {
              id: 'text-1',
              componentId: 'text',
              props: {
                text: '{{item.name}} - Price: {{item.price|currency}}'
              }
            }
          ]
        };
        builderStore.addComponentToPage(repeaterComponent);
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Wait for repeater items
    await page.waitForSelector('.repeater-item', { timeout: 5000 });
    
    // Verify repeated content
    await expect(page.locator('text=iPhone 14 - Price: $999.00')).toBeVisible();
    await expect(page.locator('text=MacBook Pro - Price: $2,499.00')).toBeVisible();
    await expect(page.locator('text=AirPods - Price: $249.00')).toBeVisible();
  });

  test('repeater button events work in preview mode', async ({ page }) => {
    // Add components
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        // Add text to show selected item
        builderStore.addComponentToPage({
          id: 'text-display',
          componentId: 'text',
          props: {
            text: 'Selected: {{selectedProduct.name || "None"}}'
          }
        });
        
        // Add repeater with button
        builderStore.addComponentToPage({
          id: 'repeater-2',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'horizontal'
          },
          children: [
            {
              id: 'button-1',
              componentId: 'button',
              props: {
                label: 'Select {{item.name}}'
              },
              events: [{
                trigger: 'click',
                action: {
                  type: 'updateState',
                  parameters: {
                    key: 'selectedProduct',
                    value: '{{item}}'
                  }
                }
              }]
            }
          ]
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Wait for buttons
    await page.waitForSelector('button:has-text("Select iPhone 14")', { timeout: 5000 });
    
    // Initial state
    await expect(page.locator('text=Selected: None')).toBeVisible();
    
    // Click button
    await page.click('button:has-text("Select iPhone 14")');
    
    // Verify state updated
    await expect(page.locator('text=Selected: iPhone 14')).toBeVisible();
    
    // Click another button
    await page.click('button:has-text("Select MacBook Pro")');
    await expect(page.locator('text=Selected: MacBook Pro')).toBeVisible();
  });

  test('repeater grid layout works in preview mode', async ({ page }) => {
    // Add repeater with grid layout
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'repeater-grid',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'grid',
            gridColumns: 3,
            spacing: 16
          },
          children: [
            {
              id: 'container-1',
              componentId: 'container',
              style: {
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              },
              children: [
                {
                  id: 'product-name',
                  componentId: 'text',
                  props: {
                    text: '{{item.name}}',
                    type: 'heading3'
                  }
                },
                {
                  id: 'product-price',
                  componentId: 'text',
                  props: {
                    text: '{{item.price|currency}}'
                  }
                }
              ]
            }
          ]
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Wait for grid
    await page.waitForSelector('.repeater-items', { timeout: 5000 });
    
    // Verify grid layout
    const repeaterItems = page.locator('.repeater-items');
    await expect(repeaterItems).toHaveCSS('display', 'grid');
    
    // Verify items
    const items = page.locator('.repeater-item');
    await expect(items).toHaveCount(3);
    
    // Verify content in cards
    await expect(page.locator('h3:has-text("iPhone 14")')).toBeVisible();
    await expect(page.locator('h3:has-text("MacBook Pro")')).toBeVisible();
  });

  test('empty data states work correctly', async ({ page }) => {
    // Add table with no data source
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'empty-table',
          componentId: 'table',
          props: {
            data: '',
            columns: [{ field: 'name', label: 'Name' }]
          }
        });
        
        builderStore.addComponentToPage({
          id: 'empty-repeater',
          componentId: 'repeater',
          props: {
            dataSource: '{{nonexistent}}',
            direction: 'vertical'
          },
          children: [{
            id: 'text-1',
            componentId: 'text',
            props: { text: '{{item.name}}' }
          }]
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Verify empty states
    await expect(page.locator('text=No data available')).toBeVisible();
    await expect(page.locator('text=No data to display')).toBeVisible();
  });

  test('complex nested layouts work in preview', async ({ page }) => {
    // Create users table
    await page.evaluate(() => {
      const databaseService = (window as any).databaseService;
      if (databaseService) {
        const appId = 'test-app';
        
        databaseService.createTable(appId, {
          id: 'users',
          name: 'users',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'email', type: 'text' },
            { name: 'active', type: 'boolean' }
          ]
        });
        
        const users = [
          { id: '1', name: 'John Doe', email: 'john@example.com', active: true },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: false }
        ];
        
        users.forEach(user => {
          databaseService.insertData(appId, 'users', user);
        });
      }
    });
    
    // Add complex repeater
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'user-repeater',
          componentId: 'repeater',
          props: {
            dataSource: '{{users}}',
            direction: 'vertical'
          },
          children: [
            {
              id: 'user-container',
              componentId: 'container',
              props: {
                layout: 'horizontal',
                gap: 16
              },
              style: {
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px'
              },
              children: [
                {
                  id: 'index-text',
                  componentId: 'text',
                  props: {
                    text: '{{index + 1}}.'
                  },
                  style: {
                    fontWeight: 'bold',
                    minWidth: '30px'
                  }
                },
                {
                  id: 'name-text',
                  componentId: 'text',
                  props: {
                    text: '{{item.name}}'
                  },
                  style: {
                    flex: 1
                  }
                },
                {
                  id: 'email-text',
                  componentId: 'text',
                  props: {
                    text: '{{item.email}}'
                  },
                  style: {
                    color: '#6b7280'
                  }
                }
              ]
            }
          ]
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Verify numbering
    await expect(page.locator('text=1.')).toBeVisible();
    await expect(page.locator('text=2.')).toBeVisible();
    
    // Verify horizontal layout
    const container = page.locator('.repeater-item').first().locator('[data-component-type="container"]');
    await expect(container).toHaveCSS('display', 'flex');
    
    // Verify data
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
  });
});