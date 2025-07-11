import { test, expect } from '@playwright/test';

test.describe('Magic Text Data Type Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Setup test data
    await page.evaluate(() => {
      const databaseService = (window as any).databaseService;
      if (databaseService) {
        const appId = 'test-app';
        
        // Create products table
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
          { id: '2', name: 'MacBook Pro', price: 2499, category: 'Computers' }
        ];
        
        products.forEach(product => {
          databaseService.insertData(appId, 'products', product);
        });
      }
    });
  });

  test('table component should only show collection options in magic text picker', async ({ page }) => {
    // Add table component
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'table-1',
          componentId: 'table',
          props: {
            data: '',
            columns: [{ field: 'name', label: 'Name' }]
          }
        });
      }
    });
    
    // Select table and try to set data source
    await page.click('[data-component-type="table"]');
    await page.click('[placeholder*="table name"]');
    await page.click('button:has-text("+")');
    
    // Verify only collections are shown
    await expect(page.locator('text=All products')).toBeVisible();
    
    // Verify singleton options are NOT shown (e.g., user data)
    await expect(page.locator('text=User')).not.toBeVisible();
    await expect(page.locator('text=Name').first()).not.toBeVisible(); // User name
    
    // Verify helper text shows collection guidance
    await expect(page.locator('text=Use table names like {{products}}')).toBeVisible();
    
    // Select a collection
    await page.click('text=All products');
    
    // Verify it sets the correct value
    await expect(page.locator('[placeholder*="table name"]')).toHaveValue('{{products}}');
  });

  test('repeater component should only show collection options', async ({ page }) => {
    // Add repeater component
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'repeater-1',
          componentId: 'repeater',
          props: {
            dataSource: '',
            direction: 'vertical'
          }
        });
      }
    });
    
    // Select repeater and configure data source
    await page.click('[data-component-type="repeater"]');
    await page.click('[placeholder*="table name"]');
    await page.click('button:has-text("+")');
    
    // Should only show collections
    await expect(page.locator('text=All products')).toBeVisible();
    
    // Should not show singleton user data
    await expect(page.locator('text=User')).not.toBeVisible();
    
    // Should show helper text for collections
    await expect(page.locator('text=Use table names like {{products}}')).toBeVisible();
  });

  test('text component should show singleton options when in repeater context', async ({ page }) => {
    // Add repeater with text child
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'repeater-1',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'vertical'
          },
          children: [{
            id: 'text-1',
            componentId: 'text',
            props: {
              text: ''
            }
          }]
        });
      }
    });
    
    // Select the text component inside repeater
    await page.click('.repeater-template-editor [data-component-type="text"]');
    await page.click('[placeholder*="text or add dynamic"]');
    await page.click('button:has-text("+")');
    
    // Should show Current Item options
    await expect(page.locator('text=Current Item')).toBeVisible();
    await page.click('text=Current Item');
    
    // Should show item properties
    await expect(page.locator('text=Current Item').first()).toBeVisible();
    await expect(page.locator('text=Item Index')).toBeVisible();
    
    // Should also show singleton user data
    await page.click('text=User');
    await expect(page.locator('text=Name').first()).toBeVisible(); // User name
    await expect(page.locator('text=Email')).toBeVisible();
  });

  test('text component should show all options when not in repeater context', async ({ page }) => {
    // Add standalone text component
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'text-1',
          componentId: 'text',
          props: {
            text: ''
          }
        });
      }
    });
    
    // Select text component
    await page.click('[data-component-type="text"]');
    await page.click('[placeholder*="text or add dynamic"]');
    await page.click('button:has-text("+")');
    
    // Should show both singleton and collection categories
    await expect(page.locator('text=User')).toBeVisible();
    await expect(page.locator('text=products')).toBeVisible();
    
    // Should NOT show Current Item (not in repeater)
    await expect(page.locator('text=Current Item')).not.toBeVisible();
    
    // Should show generic helper text
    await expect(page.locator('text=Dynamic content will be replaced')).toBeVisible();
  });

  test('table data binding works correctly in preview', async ({ page }) => {
    // Add and configure table
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'table-1',
          componentId: 'table',
          props: {
            data: '{{products}}',
            columns: [
              { field: 'name', label: 'Product' },
              { field: 'price', label: 'Price', format: 'currency' }
            ]
          }
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Verify table displays data correctly
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=iPhone 14')).toBeVisible();
    await expect(page.locator('text=MacBook Pro')).toBeVisible();
    await expect(page.locator('text=$999.00')).toBeVisible();
    await expect(page.locator('text=$2,499.00')).toBeVisible();
  });

  test('repeater data binding works correctly in preview', async ({ page }) => {
    // Add and configure repeater
    await page.evaluate(() => {
      const builderStore = (window as any).useBuilderStore?.getState();
      if (builderStore) {
        builderStore.addComponentToPage({
          id: 'repeater-1',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'vertical'
          },
          children: [{
            id: 'text-1',
            componentId: 'text',
            props: {
              text: '{{item.name}} - {{item.price|currency}}'
            }
          }]
        });
      }
    });
    
    // Enter preview mode
    await page.click('button:has-text("Preview")');
    
    // Verify repeater displays items correctly
    await expect(page.locator('text=iPhone 14 - $999.00')).toBeVisible();
    await expect(page.locator('text=MacBook Pro - $2,499.00')).toBeVisible();
  });

  test('validation prevents wrong data types', async ({ page }) => {
    // Test validation function directly
    const validationResults = await page.evaluate(() => {
      const MagicTextProcessor = (window as any).MagicTextProcessor;
      if (!MagicTextProcessor) return null;
      
      return {
        // Collection validations
        validCollection1: MagicTextProcessor.validateDataType('{{products}}', 'collection'),
        validCollection2: MagicTextProcessor.validateDataType('{{users}}', 'collection'),
        invalidCollection1: MagicTextProcessor.validateDataType('{{user.name}}', 'collection'),
        invalidCollection2: MagicTextProcessor.validateDataType('{{products[0].name}}', 'collection'),
        
        // Singleton validations
        validSingleton1: MagicTextProcessor.validateDataType('{{user.name}}', 'singleton'),
        validSingleton2: MagicTextProcessor.validateDataType('{{products[0].name}}', 'singleton'),
        validSingleton3: MagicTextProcessor.validateDataType('{{products.count()}}', 'singleton'),
        invalidSingleton1: MagicTextProcessor.validateDataType('{{products}}', 'singleton'),
        invalidSingleton2: MagicTextProcessor.validateDataType('{{users}}', 'singleton'),
        
        // Any type (should all be true)
        anyType1: MagicTextProcessor.validateDataType('{{products}}', 'any'),
        anyType2: MagicTextProcessor.validateDataType('{{user.name}}', 'any'),
      };
    });
    
    if (validationResults) {
      // Collection validations
      expect(validationResults.validCollection1).toBe(true);
      expect(validationResults.validCollection2).toBe(true);
      expect(validationResults.invalidCollection1).toBe(false);
      expect(validationResults.invalidCollection2).toBe(false);
      
      // Singleton validations
      expect(validationResults.validSingleton1).toBe(true);
      expect(validationResults.validSingleton2).toBe(true);
      expect(validationResults.validSingleton3).toBe(true);
      expect(validationResults.invalidSingleton1).toBe(false);
      expect(validationResults.invalidSingleton2).toBe(false);
      
      // Any type
      expect(validationResults.anyType1).toBe(true);
      expect(validationResults.anyType2).toBe(true);
    }
  });
});