import { test, expect, Page } from '@playwright/test';

// Helper to wait for the app to fully load
async function waitForAppReady(page: Page) {
  // Wait for the main navigation or canvas to be visible
  await page.waitForSelector('[data-testid="canvas-drop-zone"], .component-palette, nav', { timeout: 30000 });
  await page.waitForTimeout(2000); // Additional wait for full app initialization
}

// Helper to create a new app or use existing one
async function setupApp(page: Page) {
  await page.goto('/');
  await waitForAppReady(page);
  
  // Check if we're already in an app or need to create/select one
  const isInApp = await page.locator('[data-testid="canvas-drop-zone"]').isVisible();
  
  if (!isInApp) {
    // Look for existing app or create new one
    const hasApps = await page.locator('text=Test App').first().isVisible();
    
    if (hasApps) {
      // Click on existing app
      await page.click('text=Test App');
      await waitForAppReady(page);
    } else {
      // Create new app
      const createButton = page.locator('button:has-text("Create"), button:has-text("New App"), text=Create New App').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.fill('input[placeholder*="app"], input[placeholder*="name"]', 'Test App');
        await page.click('button:has-text("Create")');
        await waitForAppReady(page);
      }
    }
  }
}

// Helper to setup database tables through the UI
async function setupDatabaseTables(page: Page) {
  // Go to Database tab
  await page.click('text=Database');
  await page.waitForTimeout(1000);
  
  // Create products table
  const hasProductsTable = await page.locator('text=products').first().isVisible();
  
  if (!hasProductsTable) {
    // Create products table
    await page.click('button:has-text("Create Table"), button:has-text("New Table"), button:has-text("Add Table")');
    await page.fill('input[placeholder*="table"], input[placeholder*="name"]', 'products');
    
    // Add fields
    const fields = [
      { name: 'name', type: 'text' },
      { name: 'price', type: 'number' },
      { name: 'description', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'imageUrl', type: 'text' },
      { name: 'inStock', type: 'boolean' }
    ];
    
    for (const field of fields) {
      await page.click('button:has-text("Add Field"), text=Add Field');
      await page.fill('input[placeholder*="field"], input[placeholder*="name"]', field.name);
      
      // Select field type
      const typeSelector = page.locator('select').last();
      if (await typeSelector.isVisible()) {
        await typeSelector.selectOption(field.type);
      }
      
      await page.click('button:has-text("Add"), button:has-text("Save")');
    }
    
    await page.click('button:has-text("Create"), button:has-text("Save Table")');
    await page.waitForTimeout(1000);
    
    // Add sample data
    await page.click('text=products');
    
    const sampleProducts = [
      { name: 'iPhone 14', price: '999', description: 'Latest iPhone', category: 'Electronics', imageUrl: 'https://via.placeholder.com/200/007AFF/FFFFFF?text=iPhone', inStock: true },
      { name: 'MacBook Pro', price: '2499', description: 'M3 Pro chip', category: 'Computers', imageUrl: 'https://via.placeholder.com/200/333333/FFFFFF?text=MacBook', inStock: true },
      { name: 'AirPods', price: '249', description: 'Wireless earbuds', category: 'Audio', imageUrl: 'https://via.placeholder.com/200/FFFFFF/000000?text=AirPods', inStock: false }
    ];
    
    for (const product of sampleProducts) {
      await page.click('button:has-text("Add Record"), button:has-text("New Record")');
      
      await page.fill('input[name="name"]', product.name);
      await page.fill('input[name="price"]', product.price);
      await page.fill('input[name="description"]', product.description);
      await page.fill('input[name="category"]', product.category);
      await page.fill('input[name="imageUrl"]', product.imageUrl);
      
      if (product.inStock) {
        await page.check('input[name="inStock"]');
      }
      
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(500);
    }
  }
  
  // Go back to Pages/Design tab
  await page.click('text=Pages, text=Design, text=Builder');
  await page.waitForTimeout(1000);
}

// Helper to drag component from palette to canvas
async function dragComponentToCanvas(page: Page, componentName: string) {
  const palette = page.locator('.component-palette, [data-testid="component-palette"]');
  const canvas = page.locator('[data-testid="canvas-drop-zone"]');
  
  // Find the component in the palette
  const component = palette.locator(`text=${componentName}, [data-component="${componentName}"], [data-type="${componentName}"]`).first();
  
  // Get bounding boxes
  const componentBox = await component.boundingBox();
  const canvasBox = await canvas.boundingBox();
  
  if (componentBox && canvasBox) {
    // Perform drag and drop
    await page.mouse.move(componentBox.x + componentBox.width / 2, componentBox.y + componentBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    await page.mouse.up();
    await page.waitForTimeout(1000);
  } else {
    // Fallback: try clicking the component then clicking canvas
    await component.click();
    await canvas.click();
    await page.waitForTimeout(1000);
  }
}

test.describe('Human-Like Data Binding E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page);
    await setupDatabaseTables(page);
  });

  test('should create table component with magic text data binding like a human user', async ({ page }) => {
    // Step 1: Drag table component to canvas
    await dragComponentToCanvas(page, 'Table');
    
    // Step 2: Select the table component
    const tableComponent = page.locator('[data-component-type="table"], .table-component').first();
    await tableComponent.click();
    await page.waitForTimeout(500);
    
    // Step 3: Configure data source in properties panel
    const dataSourceInput = page.locator('input[placeholder*="table"], input[placeholder*="data"]').first();
    await dataSourceInput.click();
    
    // Step 4: Use magic text picker to select products
    const magicTextButton = page.locator('button:has-text("+"), .magic-text-button').first();
    await magicTextButton.click();
    await page.waitForTimeout(500);
    
    // Step 5: Select products from magic text picker
    const productsOption = page.locator('text=products, text=All products').first();
    await productsOption.click();
    await page.waitForTimeout(500);
    
    // Step 6: Verify data source is set
    await expect(dataSourceInput).toHaveValue(/.*products.*/);
    
    // Step 7: Configure columns
    const columnsTextarea = page.locator('textarea[placeholder*="columns"], textarea').first();
    if (await columnsTextarea.isVisible()) {
      const columnsConfig = `[
        { "field": "name", "label": "Product Name" },
        { "field": "price", "label": "Price", "format": "currency" },
        { "field": "category", "label": "Category" },
        { "field": "inStock", "label": "Available" }
      ]`;
      await columnsTextarea.fill(columnsConfig);
    }
    
    // Step 8: Enable table styling options
    const stripedCheckbox = page.locator('input[type="checkbox"]:near(:text("Striped"))').first();
    if (await stripedCheckbox.isVisible()) {
      await stripedCheckbox.check();
    }
    
    // Step 9: Enter preview mode
    const previewButton = page.locator('button:has-text("Preview"), .preview-button').first();
    await previewButton.click();
    await page.waitForTimeout(3000); // Wait for preview to load
    
    // Step 10: Verify table displays data in preview
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=iPhone 14')).toBeVisible();
    await expect(page.locator('text=MacBook Pro')).toBeVisible();
    await expect(page.locator('text=AirPods')).toBeVisible();
    
    // Step 11: Verify currency formatting
    await expect(page.locator('text=$999.00')).toBeVisible();
    await expect(page.locator('text=$2,499.00')).toBeVisible();
    
    // Step 12: Verify boolean values display
    await expect(page.locator('text=true')).toBeVisible();
    await expect(page.locator('text=false')).toBeVisible();
  });

  test('should create repeater with card layout and magic text like a human', async ({ page }) => {
    // Step 1: Add a heading first
    await dragComponentToCanvas(page, 'Text');
    const headingText = page.locator('[data-component-type="text"]').first();
    await headingText.click();
    
    // Configure as heading
    const textInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').first();
    await textInput.fill('Product Catalog');
    
    const textTypeSelect = page.locator('select').first();
    if (await textTypeSelect.isVisible()) {
      await textTypeSelect.selectOption('heading1');
    }
    
    // Step 2: Add repeater component
    await dragComponentToCanvas(page, 'Repeater');
    const repeaterComponent = page.locator('[data-component-type="repeater"]').first();
    await repeaterComponent.click();
    await page.waitForTimeout(500);
    
    // Step 3: Set repeater data source using magic text
    const dataSourceInput = page.locator('input[placeholder*="table"], input[placeholder*="data"]').first();
    await dataSourceInput.click();
    
    const magicTextButton = page.locator('button:has-text("+")').first();
    await magicTextButton.click();
    await page.waitForTimeout(500);
    
    // Select products collection
    await page.click('text=products, text=All products');
    await page.waitForTimeout(500);
    
    // Step 4: Configure repeater layout
    const directionSelect = page.locator('select[name="direction"], select').first();
    if (await directionSelect.isVisible()) {
      await directionSelect.selectOption('grid');
    }
    
    const columnsInput = page.locator('input[name="gridColumns"], input[name="columns"]').first();
    if (await columnsInput.isVisible()) {
      await columnsInput.fill('2');
    }
    
    // Step 5: Add container to repeater template
    const templateArea = page.locator('.repeater-template, .template-editor').first();
    
    // Drag container into template area
    await dragComponentToCanvas(page, 'Container');
    
    // Step 6: Add image to container
    await dragComponentToCanvas(page, 'Image');
    
    // Configure image with magic text
    const imageComponent = page.locator('[data-component-type="image"]').first();
    await imageComponent.click();
    
    const imageSrcInput = page.locator('input[placeholder*="image"], input[placeholder*="URL"]').first();
    await imageSrcInput.click();
    
    // Use magic text for image source
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    // Should show Current Item options since we're in repeater
    await expect(page.locator('text=Current Item')).toBeVisible();
    await page.click('text=Current Item');
    
    // Select imageUrl field
    await page.click('text=imageUrl');
    await page.waitForTimeout(500);
    
    // Step 7: Add product name text
    await dragComponentToCanvas(page, 'Text');
    
    const nameText = page.locator('[data-component-type="text"]').last();
    await nameText.click();
    
    const nameTextInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').last();
    await nameTextInput.click();
    
    // Use magic text for product name
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    await page.click('text=Current Item');
    await page.click('text=name');
    await page.waitForTimeout(500);
    
    // Step 8: Add price text with formatting
    await dragComponentToCanvas(page, 'Text');
    
    const priceText = page.locator('[data-component-type="text"]').last();
    await priceText.click();
    
    const priceTextInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').last();
    await priceTextInput.fill('{{item.price|currency}}');
    
    // Step 9: Add buy button with event
    await dragComponentToCanvas(page, 'Button');
    
    const buttonComponent = page.locator('[data-component-type="button"]').first();
    await buttonComponent.click();
    
    const buttonLabelInput = page.locator('input[placeholder*="button"], input[placeholder*="label"]').first();
    await buttonLabelInput.fill('Buy {{item.name}}');
    
    // Add click event
    const eventsTab = page.locator('text=Events').first();
    if (await eventsTab.isVisible()) {
      await eventsTab.click();
      
      await page.click('button:has-text("Add Event")');
      await page.selectOption('select[name="trigger"]', 'click');
      await page.selectOption('select[name="actionType"]', 'updateState');
      await page.fill('input[name="key"]', 'selectedProduct');
      await page.fill('input[name="value"]', '{{item}}');
      await page.click('button:has-text("Save Event")');
    }
    
    // Step 10: Add selection display
    await dragComponentToCanvas(page, 'Text');
    
    const selectionText = page.locator('[data-component-type="text"]').last();
    await selectionText.click();
    
    const selectionInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').last();
    await selectionInput.fill('Selected: {{selectedProduct.name || "None"}}');
    
    // Step 11: Enter preview mode
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(5000); // Wait for full preview load
    
    // Step 12: Verify products display in grid
    const repeaterItems = page.locator('.repeater-items, .repeater-container');
    await expect(repeaterItems).toBeVisible();
    
    // Check for product names
    await expect(page.locator('text=iPhone 14')).toBeVisible();
    await expect(page.locator('text=MacBook Pro')).toBeVisible();
    await expect(page.locator('text=AirPods')).toBeVisible();
    
    // Check for currency formatting
    await expect(page.locator('text=$999.00')).toBeVisible();
    await expect(page.locator('text=$2,499.00')).toBeVisible();
    
    // Check images are loaded
    const images = page.locator('img');
    await expect(images.first()).toBeVisible();
    
    // Step 13: Test button interaction
    await expect(page.locator('text=Selected: None')).toBeVisible();
    
    // Click buy button
    const buyButton = page.locator('button:has-text("Buy iPhone 14")').first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      await page.waitForTimeout(1000);
      
      // Verify state updated
      await expect(page.locator('text=Selected: iPhone 14')).toBeVisible();
    }
  });

  test('should test magic text picker shows correct options based on context', async ({ page }) => {
    // Test 1: Table component should only show collections
    await dragComponentToCanvas(page, 'Table');
    await page.click('[data-component-type="table"]');
    
    const tableDataInput = page.locator('input[placeholder*="table"], input[placeholder*="data"]').first();
    await tableDataInput.click();
    
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    // Should show products table
    await expect(page.locator('text=products')).toBeVisible();
    
    // Should NOT show user singleton data (if user category exists)
    const userCategory = page.locator('text=User').first();
    if (await userCategory.isVisible()) {
      await expect(userCategory).not.toBeVisible();
    }
    
    // Close picker
    await page.press('Escape');
    
    // Test 2: Text component outside repeater should show all options
    await dragComponentToCanvas(page, 'Text');
    const textComponent = page.locator('[data-component-type="text"]').last();
    await textComponent.click();
    
    const textInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').last();
    await textInput.click();
    
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    // Should show collections AND singletons
    await expect(page.locator('text=products')).toBeVisible();
    
    // Close picker
    await page.press('Escape');
    
    // Test 3: Add repeater and test child component context
    await dragComponentToCanvas(page, 'Repeater');
    const repeater = page.locator('[data-component-type="repeater"]').last();
    await repeater.click();
    
    // Set repeater data source
    const repeaterDataInput = page.locator('input[placeholder*="table"], input[placeholder*="data"]').last();
    await repeaterDataInput.click();
    await page.click('button:has-text("+")');
    await page.click('text=products');
    await page.waitForTimeout(500);
    
    // Add text component to repeater
    await dragComponentToCanvas(page, 'Text');
    
    // Select the text component in the repeater template
    const repeaterTextComponent = page.locator('.repeater-template [data-component-type="text"], .template-editor [data-component-type="text"]').first();
    await repeaterTextComponent.click();
    
    const repeaterTextInput = page.locator('input[placeholder*="text"], textarea[placeholder*="text"]').last();
    await repeaterTextInput.click();
    
    await page.click('button:has-text("+")');
    await page.waitForTimeout(500);
    
    // Should show Current Item category
    await expect(page.locator('text=Current Item')).toBeVisible();
    
    // Click on Current Item
    await page.click('text=Current Item');
    
    // Should show item properties
    await expect(page.locator('text=name, text=price')).toBeVisible();
  });

  test('should handle empty states and errors gracefully', async ({ page }) => {
    // Test empty table
    await dragComponentToCanvas(page, 'Table');
    await page.click('[data-component-type="table"]');
    
    // Don't set data source, go straight to preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(2000);
    
    // Should show empty state
    await expect(page.locator('text=No data available, text=Set a data source')).toBeVisible();
    
    // Go back to builder
    await page.click('button:has-text("Builder"), button:has-text("Edit"), text=Edit');
    
    // Test empty repeater
    await dragComponentToCanvas(page, 'Repeater');
    await page.click('[data-component-type="repeater"]');
    
    // Set non-existent data source
    const dataInput = page.locator('input[placeholder*="table"], input[placeholder*="data"]').last();
    await dataInput.fill('{{nonexistent}}');
    
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(2000);
    
    // Should show empty state
    await expect(page.locator('text=No data to display')).toBeVisible();
  });
});