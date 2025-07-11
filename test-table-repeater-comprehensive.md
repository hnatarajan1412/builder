# Comprehensive Table & Repeater Testing Guide

## Prerequisites
1. Start the app: `npm run dev`
2. Open http://localhost:3006
3. Create or select an app
4. Set up test data in Database tab

## Test Data Setup

### 1. Create Tables
Go to Database tab and create these tables:

#### Products Table
- Fields: name (text), price (number), description (text), category (text), imageUrl (text), inStock (boolean)
- Sample data:
  ```
  1. iPhone 14, 999, "Latest iPhone model", "Electronics", "https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone", true
  2. MacBook Pro, 2499, "M3 Pro chip", "Computers", "https://via.placeholder.com/200x200/333333/FFFFFF?text=MacBook", true
  3. AirPods Pro, 249, "Active noise cancellation", "Audio", "https://via.placeholder.com/200x200/FFFFFF/000000?text=AirPods", false
  4. iPad Air, 599, "10.9-inch display", "Tablets", "https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=iPad", true
  ```

#### Users Table
- Fields: name (text), email (text), role (text), active (boolean)
- Sample data:
  ```
  1. John Doe, john@example.com, Admin, true
  2. Jane Smith, jane@example.com, User, true
  3. Bob Johnson, bob@example.com, Manager, false
  ```

#### Orders Table
- Fields: orderNumber (text), customerName (text), total (number), status (text), date (text)
- Sample data:
  ```
  1. ORD-001, John Doe, 1248, Shipped, 2024-01-15
  2. ORD-002, Jane Smith, 599, Processing, 2024-01-16
  3. ORD-003, Bob Johnson, 2748, Delivered, 2024-01-14
  ```

## Test Scenarios

### Test 1: Basic Table with Magic Text
1. **Setup:**
   - Drag a Table component to canvas
   - In Properties > Data Source: Type `{{products}}`
   - Keep default columns or configure:
     ```json
     [
       { "field": "name", "label": "Product Name" },
       { "field": "price", "label": "Price", "format": "currency" },
       { "field": "category", "label": "Category" },
       { "field": "inStock", "label": "Available" }
     ]
     ```

2. **Preview Mode Tests:**
   - ✅ All products should display
   - ✅ Price should show as currency (e.g., $999.00)
   - ✅ Boolean values should show as "true/false"
   - ✅ Striped rows if enabled
   - ✅ Hover effect if enabled

### Test 2: Basic Repeater with Text Components
1. **Setup:**
   - Drag a Repeater component
   - Data Source: `{{products}}`
   - Drop a Container inside repeater
   - Inside container, add:
     - Text: `{{item.name}}`
     - Text: `Price: {{item.price|currency}}`
     - Text: `{{item.description}}`

2. **Preview Mode Tests:**
   - ✅ Should show 4 product cards
   - ✅ Each card displays correct data
   - ✅ Currency formatting works

### Test 3: Repeater with Button Events
1. **Setup:**
   - Create a Text component above repeater: `Selected: {{selectedProduct.name || 'None'}}`
   - In repeater (data: `{{products}}`), add:
     - Text: `{{item.name}}`
     - Button: Label = `Select {{item.name}}`
     - Button Event: 
       - Trigger: Click
       - Action: Update State
       - Key: selectedProduct
       - Value: {{item}}

2. **Preview Mode Tests:**
   - ✅ Click each button
   - ✅ Selected product name should update
   - ✅ No console errors

### Test 4: Repeater with Images
1. **Setup:**
   - Repeater with `{{products}}`
   - Direction: Grid, Columns: 2
   - Add inside:
     - Image: src = `{{item.imageUrl}}`, alt = `{{item.name}}`
     - Text: `{{item.name}}`

2. **Preview Mode Tests:**
   - ✅ Images load correctly
   - ✅ Grid layout with 2 columns
   - ✅ Alt text is set properly

### Test 5: Repeater with Mixed Components
1. **Setup:**
   - Repeater with `{{users}}`
   - Add Container with horizontal layout
   - Inside container:
     - Text: `{{index + 1}}. {{item.name}}`
     - Text: `{{item.email}}`
     - Text: `Role: {{item.role}}`
     - Container with:
       - Conditional visibility: `{{item.active}}`
       - Text: "Active" with green background

2. **Preview Mode Tests:**
   - ✅ Index numbers display correctly (1, 2, 3)
   - ✅ All user data shows
   - ✅ "Active" badge only shows for active users

### Test 6: Table with Dynamic Columns
1. **Setup:**
   - Table with `{{orders}}`
   - Columns:
     ```json
     [
       { "field": "orderNumber", "label": "Order #" },
       { "field": "customerName", "label": "Customer" },
       { "field": "total", "label": "Total", "format": "currency" },
       { "field": "status", "label": "Status" },
       { "field": "date", "label": "Order Date", "format": "date:MM/DD/YYYY" }
     ]
     ```

2. **Preview Mode Tests:**
   - ✅ Order numbers display
   - ✅ Total shows as currency
   - ✅ Date formatting works

### Test 7: Repeater in Form
1. **Setup:**
   - Add Form component
   - Set Target Table: products
   - Inside form, add Repeater with static data:
     ```
     [
       { "field": "name", "label": "Product Name", "type": "text" },
       { "field": "price", "label": "Price", "type": "number" },
       { "field": "category", "label": "Category", "type": "text" }
     ]
     ```
   - In repeater template:
     - Text: `{{item.label}}`
     - Input: placeholder = `Enter {{item.label}}`, name = `{{item.field}}`

2. **Preview Mode Tests:**
   - ✅ Form renders all fields
   - ✅ Submit saves to database
   - ✅ New record appears in products table

### Test 8: Nested Data Display
1. **Setup:**
   - Create a Repeater with categories
   - Inside, add another Repeater for products in each category
   - Use filtering or grouped data

2. **Preview Mode Tests:**
   - ✅ Nested structure displays correctly
   - ✅ Each level has access to its context

### Test 9: Repeater with Conditional Rendering
1. **Setup:**
   - Repeater with `{{products}}`
   - Add components with visibility conditions:
     - Show "In Stock" badge when `{{item.inStock}}`
     - Show "Out of Stock" when `{{!item.inStock}}`
     - Show discount badge when `{{item.price > 1000}}`

2. **Preview Mode Tests:**
   - ✅ Conditional components show/hide correctly
   - ✅ Logic evaluates properly for each item

### Test 10: Performance Test
1. **Setup:**
   - Create a table with 50+ records
   - Create a repeater with same data
   - Add complex templates with multiple components

2. **Preview Mode Tests:**
   - ✅ Page loads without freezing
   - ✅ Scrolling is smooth
   - ✅ Interactions remain responsive

## Common Issues to Check

1. **Data Binding:**
   - Empty data source shows appropriate message
   - Invalid table names handle gracefully
   - Magic text expressions evaluate correctly

2. **Event Handling:**
   - Click events fire in preview mode
   - State updates work correctly
   - Navigation between pages works

3. **Formatting:**
   - Currency formatting: $1,234.56
   - Date formatting: 01/15/2024
   - Number formatting: 1,234.56
   - Percentage: 45.5%

4. **Edge Cases:**
   - Empty arrays
   - Null/undefined values
   - Very long text
   - Special characters in data

## Expected Results

After completing all tests:
- ✅ Tables display data with proper formatting
- ✅ Repeaters show correct number of items
- ✅ Magic text expressions work in all contexts
- ✅ Events trigger correctly
- ✅ Conditional rendering works
- ✅ No console errors
- ✅ Performance is acceptable

## Debugging Tips

1. Open browser console (F12)
2. Check for any red errors
3. Look for warnings about missing data
4. Verify magic text syntax: `{{expression}}`
5. Check if table exists in database
6. Ensure data has the expected structure

## Quick Test Commands

```javascript
// In browser console to check data:
console.log(window.__APP_DATA__);

// To manually trigger re-render:
location.reload();
```