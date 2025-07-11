import { test, expect, Page } from '@playwright/test';

// Helper to wait for app to load and setup test data
async function setupAppWithData(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(2000); // Wait for app to fully load
  
  // Create test data for the platform
  await page.evaluate(() => {
    const databaseService = (window as any).databaseService;
    const builderStore = (window as any).useBuilderStore?.getState();
    
    if (databaseService && builderStore) {
      const appId = 'test-app';
      
      // Create products collection
      databaseService.createTable(appId, {
        id: 'products',
        name: 'products',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'price', type: 'number' },
          { name: 'description', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'imageUrl', type: 'text' },
          { name: 'inStock', type: 'boolean' },
          { name: 'rating', type: 'number' }
        ]
      });
      
      // Insert sample products
      const products = [
        {
          name: 'Wireless Headphones',
          price: 99.99,
          description: 'Premium quality wireless headphones with noise cancellation',
          category: 'Electronics',
          imageUrl: 'https://via.placeholder.com/300x200',
          inStock: true,
          rating: 4.5
        },
        {
          name: 'Smart Watch',
          price: 299.99,
          description: 'Feature-rich smartwatch with health tracking',
          category: 'Electronics',
          imageUrl: 'https://via.placeholder.com/300x200',
          inStock: true,
          rating: 4.8
        },
        {
          name: 'Coffee Maker',
          price: 149.99,
          description: 'Programmable coffee maker with thermal carafe',
          category: 'Appliances',
          imageUrl: 'https://via.placeholder.com/300x200',
          inStock: false,
          rating: 4.2
        }
      ];
      
      products.forEach(product => {
        databaseService.insert(appId, 'products', product);
      });
      
      // Create users collection
      databaseService.createTable(appId, {
        id: 'users',
        name: 'users',
        fields: [
          { name: 'firstName', type: 'text' },
          { name: 'lastName', type: 'text' },
          { name: 'email', type: 'text' },
          { name: 'role', type: 'text' },
          { name: 'isActive', type: 'boolean' },
          { name: 'avatar', type: 'text' }
        ]
      });
      
      // Insert sample users
      const users = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'Admin',
          isActive: true,
          avatar: 'https://ui-avatars.com/api/?name=John+Doe'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'User',
          isActive: true,
          avatar: 'https://ui-avatars.com/api/?name=Jane+Smith'
        },
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          role: 'User',
          isActive: false,
          avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson'
        }
      ];
      
      users.forEach(user => {
        databaseService.insert(appId, 'users', user);
      });
      
      // Update store tables
      builderStore.tables = {
        'products': { id: 'products', name: 'products', appId, fields: [] },
        'users': { id: 'users', name: 'users', appId, fields: [] }
      };
    }
  });
}

test.describe('Data Binding E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAppWithData(page);
  });

  test('should create a product catalog with table component', async ({ page }) => {
    // Step 1: Add heading for screen title
    await page.click('[data-component-type="text"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    // Update heading text
    const heading = page.locator('.component-wrapper').first();
    await heading.click();
    await page.waitForTimeout(500);
    
    // In properties panel, update text
    await page.fill('input[placeholder="Enter text content..."]', 'Product Catalog');
    
    // Change to heading style
    await page.selectOption('select', 'heading1');
    await page.waitForTimeout(500);
    
    // Step 2: Add table component
    await page.click('[data-component-type="table"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    // Configure table data source with Magic Text
    const table = page.locator('.component-wrapper').last();
    await table.click();
    await page.waitForTimeout(500);
    
    // Set data source to products collection
    const dataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await dataInput.click();
    await page.fill('input[placeholder*="Enter value or click"]', '{{products}}');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Add columns using ADD COLUMN button
    await page.click('button:has-text("ADD COLUMN")');
    await page.click('text=name • text');
    
    await page.click('button:has-text("ADD COLUMN")');
    await page.click('text=price • number');
    
    await page.click('button:has-text("ADD COLUMN")');
    await page.click('text=inStock • boolean');
    
    // Step 3: Verify in preview mode
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Check that table shows data
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
    await expect(page.locator('text=Smart Watch')).toBeVisible();
    await expect(page.locator('text=Coffee Maker')).toBeVisible();
    
    // Verify prices are displayed
    await expect(page.locator('text=99.99')).toBeVisible();
    await expect(page.locator('text=299.99')).toBeVisible();
    
    // Close preview
    await page.click('button[aria-label*="Close"]');
  });

  test('should create a card-based product list with repeater', async ({ page }) => {
    // Add page title
    await page.click('[data-component-type="text"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const heading = page.locator('.component-wrapper').first();
    await heading.click();
    await page.fill('input[placeholder="Enter text content..."]', 'Product Grid');
    await page.selectOption('select', 'heading1');
    
    // Step 2: Add repeater with grid layout
    await page.click('[data-component-type="repeater"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    // Configure repeater
    const repeater = page.locator('.component-wrapper').last();
    await repeater.click();
    await page.waitForTimeout(500);
    
    // Set data source
    const dataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await dataInput.click();
    await page.fill('input[placeholder*="Enter value or click"]', '{{products}}');
    await page.keyboard.press('Enter');
    
    // Change to grid layout
    await page.selectOption('select[name="direction"]', 'grid');
    await page.fill('input[name="gridColumns"]', '3');
    
    // Add components inside repeater
    // Add container first for card styling
    await page.click('[data-component-type="container"]');
    const repeaterDropZone = repeater.locator('.repeater-drop-zone').first();
    await repeaterDropZone.click();
    
    // Style the container as a card
    const cardContainer = repeater.locator('.component-wrapper').first();
    await cardContainer.click();
    await page.waitForTimeout(500);
    
    // Add padding and border
    await page.click('button:has-text("Style")');
    await page.fill('input[placeholder="e.g., 10px"][name="padding"]', '16px');
    await page.fill('input[placeholder="e.g., 1px solid #ccc"][name="border"]', '1px solid #e5e7eb');
    await page.fill('input[placeholder="e.g., 4px"][name="borderRadius"]', '8px');
    
    // Add image inside container
    await page.click('[data-component-type="image"]');
    await cardContainer.locator('.component-drop-zone').click();
    
    // Configure image with magic text
    const image = cardContainer.locator('.component-wrapper').last();
    await image.click();
    const imageSrcInput = page.locator('input[placeholder*="Image URL"]').first();
    await imageSrcInput.click();
    await imageSrcInput.fill('{{item.imageUrl}}');
    
    // Add product name
    await page.click('[data-component-type="text"]');
    await cardContainer.locator('.component-drop-zone').click();
    
    const productName = cardContainer.locator('.component-wrapper').last();
    await productName.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.name}}');
    await page.selectOption('select', 'heading3');
    
    // Add price
    await page.click('[data-component-type="text"]');
    await cardContainer.locator('.component-drop-zone').click();
    
    const price = cardContainer.locator('.component-wrapper').last();
    await price.click();
    await page.fill('input[placeholder="Enter text content..."]', '${{item.price}}');
    
    // Preview the result
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Verify grid layout with 3 products
    const productCards = page.locator('.repeater-item');
    await expect(productCards).toHaveCount(3);
    
    // Verify product data is displayed
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
    await expect(page.locator('text=$99.99')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });

  test('should handle conditional display and interactions', async ({ page }) => {
    // Create a form with conditional fields
    await page.click('[data-component-type="form"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const form = page.locator('.component-wrapper').first();
    
    // Add dropdown for product selection
    await page.click('[data-component-type="input"]');
    await form.locator('.component-drop-zone').click();
    
    const dropdown = form.locator('.component-wrapper').first();
    await dropdown.click();
    
    // Configure as select/dropdown
    await page.selectOption('select[name="type"]', 'select');
    
    // Bind options to products
    const optionsInput = page.locator('textarea[placeholder*="options"]').first();
    await optionsInput.click();
    await optionsInput.fill('{{products.map(p => p.name)}}');
    
    // Add event to update state
    await page.click('button:has-text("Events")');
    await page.click('button:has-text("Add Event")');
    await page.selectOption('select[name="event"]', 'onChange');
    await page.selectOption('select[name="action"]', 'updateState');
    await page.fill('input[name="statePath"]', 'selectedProduct');
    await page.fill('input[name="value"]', 'event.target.value');
    
    // Step 3: Add selection display
    await page.click('[data-component-type="text"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const selectedDisplay = page.locator('.component-wrapper').last();
    await selectedDisplay.click();
    await page.fill('input[placeholder="Enter text content..."]', 'Selected: {{state.selectedProduct || "None"}}');
    
    // Add conditional visibility
    await page.click('button:has-text("Events")');
    
    // Set visibility condition
    const visibilityCheckbox = page.locator('input[type="checkbox"][name="hasVisibilityCondition"]');
    if (await visibilityCheckbox.isVisible()) {
      await visibilityCheckbox.check();
      await page.fill('input[name="visibilityCondition"]', '{{state.selectedProduct}}');
    }
    
    // Test in preview mode
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Initially no selection text should show
    await expect(page.locator('text=Selected: None')).toBeVisible();
    
    // Select a product
    const selectElement = page.locator('select').first();
    await selectElement.selectOption('Wireless Headphones');
    
    // Verify state update
    await expect(page.locator('text=Selected: Wireless Headphones')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });

  test('should create a user list with avatars', async ({ page }) => {
    // Add title
    await page.click('[data-component-type="text"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const heading = page.locator('.component-wrapper').first();
    await heading.click();
    await page.fill('input[placeholder="Enter text content..."]', 'User Directory');
    await page.selectOption('select', 'heading1');
    
    // Add list component
    await page.click('[data-component-type="list"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const list = page.locator('.component-wrapper').last();
    await list.click();
    
    // Bind to users data
    const dataSourceInput = page.locator('input[placeholder*="data source"]').first();
    await dataSourceInput.click();
    await dataSourceInput.fill('{{users}}');
    
    // Set display field
    await page.fill('input[name="displayField"]', 'firstName');
    
    // For more complex display, use repeater instead
    await page.click('[data-component-type="repeater"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const repeater = page.locator('.component-wrapper').last();
    await repeater.click();
    
    // Bind repeater to users
    const repeaterDataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await repeaterDataInput.click();
    await repeaterDataInput.fill('{{users}}');
    await page.keyboard.press('Enter');
    
    // Add container for user item
    await page.click('[data-component-type="container"]');
    await repeater.locator('.repeater-drop-zone').click();
    
    const userContainer = repeater.locator('.component-wrapper').first();
    await userContainer.click();
    
    // Style as horizontal flex container
    await page.click('button:has-text("Style")');
    await page.fill('input[name="display"]', 'flex');
    await page.fill('input[name="alignItems"]', 'center');
    await page.fill('input[name="gap"]', '12px');
    await page.fill('input[name="padding"]', '12px');
    await page.fill('input[name="marginBottom"]', '8px');
    
    // Add avatar image
    await page.click('[data-component-type="image"]');
    await userContainer.locator('.component-drop-zone').click();
    
    const avatar = userContainer.locator('.component-wrapper').last();
    await avatar.click();
    const avatarSrcInput = page.locator('input[placeholder*="Image URL"]').first();
    await avatarSrcInput.click();
    await avatarSrcInput.fill('{{item.avatar}}');
    
    // Style avatar
    await page.click('button:has-text("Style")');
    await page.fill('input[name="width"]', '48px');
    await page.fill('input[name="height"]', '48px');
    await page.fill('input[name="borderRadius"]', '50%');
    
    // Add user info container
    await page.click('[data-component-type="container"]');
    await userContainer.locator('.component-drop-zone').click();
    
    const infoContainer = userContainer.locator('.component-wrapper').last();
    
    // Add name
    await page.click('[data-component-type="text"]');
    await infoContainer.locator('.component-drop-zone').click();
    
    const userName = infoContainer.locator('.component-wrapper').last();
    await userName.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.firstName}} {{item.lastName}}');
    await page.selectOption('select', 'heading3');
    
    // Add email
    await page.click('[data-component-type="text"]');
    await infoContainer.locator('.component-drop-zone').click();
    
    const userEmail = infoContainer.locator('.component-wrapper').last();
    await userEmail.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.email}}');
    await page.selectOption('select', 'caption');
    
    // Preview
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Verify user list is displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
    await expect(page.locator('img[src*="John+Doe"]')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });

  test('should create a simple list component', async ({ page }) => {
    // Add list component
    await page.click('[data-component-type="list"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const list = page.locator('.component-wrapper').first();
    await list.click();
    
    // Test with static items first
    const itemsTextarea = page.locator('textarea[placeholder*="items"]').first();
    await itemsTextarea.click();
    await itemsTextarea.fill('["Apple", "Banana", "Orange", "Grape"]');
    
    // Change to ordered list
    await page.check('input[name="ordered"]');
    
    // Preview static list
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('ol')).toBeVisible();
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
    
    // Now test with dynamic data
    await list.click();
    await itemsTextarea.click();
    await itemsTextarea.clear();
    await itemsTextarea.fill('{{products.map(p => p.name)}}');
    
    // Preview dynamic list
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
    await expect(page.locator('text=Smart Watch')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });

  test('should handle nested data and conditional display', async ({ page }) => {
    // Create nested structure with categories
    await page.evaluate(() => {
      const databaseService = (window as any).databaseService;
      const appId = 'test-app';
      
      // Create categories table
      databaseService.createTable(appId, {
        id: 'categories',
        name: 'categories',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'description', type: 'text' }
        ]
      });
      
      // Insert categories
      databaseService.insert(appId, 'categories', { name: 'Electronics', description: 'Electronic devices and gadgets' });
      databaseService.insert(appId, 'categories', { name: 'Appliances', description: 'Home and kitchen appliances' });
    });
    
    // Add title
    await page.click('[data-component-type="text"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const heading = page.locator('.component-wrapper').first();
    await heading.click();
    await page.fill('input[placeholder="Enter text content..."]', 'Products by Category');
    await page.selectOption('select', 'heading1');
    
    // Add repeater for categories
    await page.click('[data-component-type="repeater"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const categoryRepeater = page.locator('.component-wrapper').last();
    await categoryRepeater.click();
    
    const categoryDataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await categoryDataInput.click();
    await categoryDataInput.fill('{{categories}}');
    await page.keyboard.press('Enter');
    
    // Add container for category section
    await page.click('[data-component-type="container"]');
    await categoryRepeater.locator('.repeater-drop-zone').click();
    
    const categoryContainer = categoryRepeater.locator('.component-wrapper').first();
    await categoryContainer.click();
    
    // Style category container
    await page.click('button:has-text("Style")');
    await page.fill('input[name="marginBottom"]', '24px');
    await page.fill('input[name="padding"]', '16px');
    await page.fill('input[name="backgroundColor"]', '#f3f4f6');
    await page.fill('input[name="borderRadius"]', '8px');
    
    // Add category name
    await page.click('[data-component-type="text"]');
    await categoryContainer.locator('.component-drop-zone').click();
    
    const categoryName = categoryContainer.locator('.component-wrapper').last();
    await categoryName.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.name}}');
    await page.selectOption('select', 'heading2');
    
    // Add nested repeater for products in this category
    await page.click('[data-component-type="repeater"]');
    await categoryContainer.locator('.component-drop-zone').click();
    
    const productRepeater = categoryContainer.locator('.component-wrapper').last();
    await productRepeater.click();
    
    // Filter products by category
    const productDataInput = page.locator('input[placeholder*="Enter value or click"]').last();
    await productDataInput.click();
    await productDataInput.fill('{{products.filter(p => p.category === item.name)}}');
    await page.keyboard.press('Enter');
    
    // Add product display
    await page.click('[data-component-type="text"]');
    await productRepeater.locator('.repeater-drop-zone').click();
    
    const productText = productRepeater.locator('.component-wrapper').last();
    await productText.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.name}} - ${{item.price}}');
    
    // Preview nested structure
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Verify categories are displayed
    await expect(page.locator('text=Electronics')).toBeVisible();
    await expect(page.locator('text=Appliances')).toBeVisible();
    
    // Verify products are grouped by category
    const electronicsSection = page.locator('text=Electronics').locator('..');
    await expect(electronicsSection.locator('text=Wireless Headphones')).toBeVisible();
    await expect(electronicsSection.locator('text=Smart Watch')).toBeVisible();
    
    const appliancesSection = page.locator('text=Appliances').locator('..');
    await expect(appliancesSection.locator('text=Coffee Maker')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });

  test('should handle empty states and error cases', async ({ page }) => {
    // Create an empty table for testing
    await page.evaluate(() => {
      const databaseService = (window as any).databaseService;
      const appId = 'test-app';
      
      databaseService.createTable(appId, {
        id: 'emptyTable',
        name: 'emptyTable',
        fields: [
          { name: 'field1', type: 'text' }
        ]
      });
    });
    
    // Add table bound to empty data
    await page.click('[data-component-type="table"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const table = page.locator('.component-wrapper').first();
    await table.click();
    
    const dataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await dataInput.click();
    await dataInput.fill('{{emptyTable}}');
    await page.keyboard.press('Enter');
    
    // Add repeater with empty data
    await page.click('[data-component-type="repeater"]');
    await page.click('[data-testid="canvas-drop-zone"]');
    
    const repeater = page.locator('.component-wrapper').last();
    await repeater.click();
    
    const repeaterDataInput = page.locator('input[placeholder*="Enter value or click"]').first();
    await repeaterDataInput.click();
    await repeaterDataInput.fill('{{emptyTable}}');
    await page.keyboard.press('Enter');
    
    // Add text to show in repeater
    await page.click('[data-component-type="text"]');
    await repeater.locator('.repeater-drop-zone').click();
    
    const itemText = repeater.locator('.component-wrapper').first();
    await itemText.click();
    await page.fill('input[placeholder="Enter text content..."]', '{{item.field1}}');
    
    // Preview empty states
    await page.click('button[title="Preview"]');
    await page.waitForTimeout(1000);
    
    // Table should show "No data available"
    await expect(page.locator('text=No data available')).toBeVisible();
    
    // Repeater should show "No data to display"
    await expect(page.locator('text=No data to display')).toBeVisible();
    
    await page.click('button[aria-label*="Close"]');
  });
});