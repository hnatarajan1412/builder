# Manual E2E Testing Guide: Data Binding

## Setup Instructions

### 1. Start the Application
```bash
npm run dev
```
Open http://localhost:3006 in your browser.

### 2. Create Test Data

#### Step 1: Create App
1. Click "Create New App" (if needed)
2. Name it "Test App"
3. Click "Create"

#### Step 2: Setup Database
1. Click "Database" tab
2. Click "Create Table"
3. Name it "products"
4. Add these fields:
   - `name` (text)
   - `price` (number)
   - `description` (text)  
   - `category` (text)
   - `imageUrl` (text)
   - `inStock` (boolean)

5. Click "Create Table"
6. Add sample products:
   ```
   Product 1:
   - name: iPhone 14 Pro
   - price: 999
   - description: Latest iPhone with Pro features
   - category: Electronics
   - imageUrl: https://via.placeholder.com/300x200/007AFF/FFFFFF?text=iPhone
   - inStock: ✓ (checked)

   Product 2:
   - name: MacBook Pro M3
   - price: 2499
   - description: Professional laptop with M3 chip
   - category: Computers
   - imageUrl: https://via.placeholder.com/300x200/333333/FFFFFF?text=MacBook
   - inStock: ✓ (checked)

   Product 3:
   - name: AirPods Pro 2
   - price: 249
   - description: Wireless earbuds with ANC
   - category: Audio
   - imageUrl: https://via.placeholder.com/300x200/FFFFFF/000000?text=AirPods
   - inStock: ✗ (unchecked)
   ```

## Test 1: Table Component with Collection Data Binding

### Expected Behavior
- ✅ Table accepts collections only ({{products}})
- ❌ Table rejects singletons ({{user.name}})
- ✅ Magic text picker shows only collection options for tables

### Steps
1. Go to "Pages" tab
2. Drag "Table" component to canvas
3. Click the table to select it
4. In Properties panel, click "Data Source" field
5. Click the "+" button to open Magic Text Picker

**✅ VERIFY**: Magic Text Picker should show:
- ✅ "All products" option
- ❌ Should NOT show "User" category or singleton options
- ✅ Helper text: "Use table names like {{products}} for collections"

6. Click "All products" (or "products")
7. Verify data source shows: `{{products}}`
8. Configure columns (optional):
   ```json
   [
     { "field": "name", "label": "Product Name" },
     { "field": "price", "label": "Price", "format": "currency" },
     { "field": "category", "label": "Category" },
     { "field": "inStock", "label": "Available" }
   ]
   ```
9. Enable "Striped Rows" checkbox
10. Click "Preview" button

**✅ VERIFY**: In preview mode:
- ✅ Table displays all 3 products
- ✅ Prices show as currency: $999.00, $2,499.00, $249.00
- ✅ Boolean values show as "true"/"false"
- ✅ Striped rows are visible
- ✅ No console errors

## Test 2: Repeater Component with Card Layout

### Expected Behavior
- ✅ Repeater accepts collections only ({{products}})
- ✅ Child components show "Current Item" options in magic text
- ✅ {{item.field}} works for accessing current item data
- ✅ Events can use {{item}} to pass entire object

### Steps
1. Go back to Builder mode
2. Drag "Text" component to canvas first
3. Select text, set content to "Product Catalog"
4. Set text type to "Heading 1"
5. Drag "Repeater" component below the heading
6. Click repeater to select it
7. In Properties, click "Data Source" field
8. Click "+" button

**✅ VERIFY**: Magic Text Picker shows:
- ✅ "All products" option  
- ❌ Should NOT show singleton options

9. Select "products"
10. Set Direction to "Grid"
11. Set Grid Columns to "2"
12. Set Spacing to "16"

### Add Card Template
13. Drag "Container" into the repeater template area
14. Style the container:
    - Padding: 16px
    - Border: 1px solid #e5e7eb
    - Border Radius: 12px
    - Background: #ffffff

### Add Image
15. Drag "Image" into the container
16. Click image to select it
17. Click "Image Source" field
18. Click "+" button

**✅ VERIFY**: Magic Text Picker now shows:
- ✅ "Current Item" category (because we're in repeater)
- ✅ Item properties: imageUrl, name, etc.

19. Click "Current Item" → "imageUrl"
20. Verify source shows: `{{item.imageUrl}}`

### Add Product Name
21. Drag "Text" into the container
22. Click text to select it
23. Click text content field
24. Click "+" button
25. Click "Current Item" → "name"
26. Verify text shows: `{{item.name}}`

### Add Price with Formatting
27. Drag another "Text" into the container
28. Click text to select it
29. Manually type: `{{item.price|currency}}`

### Add Buy Button with Event
30. Drag "Button" into the container
31. Click button to select it
32. Set button label to: `Buy {{item.name}}`
33. Go to "Events" tab
34. Click "Add Event"
35. Set Trigger: "click"
36. Set Action: "Update State"
37. Set Key: "selectedProduct"
38. Set Value: `{{item}}`
39. Click "Save Event"

### Add Selection Display
40. Drag "Text" outside the repeater
41. Set text content to: `Selected: {{selectedProduct.name || "None"}}`

### Test in Preview
42. Click "Preview" button

**✅ VERIFY**: In preview mode:
- ✅ Shows 2-column grid layout
- ✅ All 3 product cards display
- ✅ Images load (placeholder images)
- ✅ Product names show correctly
- ✅ Prices show as currency format
- ✅ "Selected: None" shows initially
- ✅ Clicking "Buy iPhone 14 Pro" updates to "Selected: iPhone 14 Pro"
- ✅ Clicking other buttons updates selection
- ✅ No console errors

## Test 3: Magic Text Context Validation

### Test Standalone Text Component
1. Go back to Builder mode
2. Drag "Text" component to canvas (outside any repeater)
3. Click text to select it
4. Click text content field
5. Click "+" button

**✅ VERIFY**: Magic Text Picker shows:
- ✅ User category (if exists)
- ✅ Products table with singleton options
- ✅ Date & Time category
- ❌ Should NOT show "Current Item" (not in repeater)

### Test Text Inside Repeater
6. Click on a text component inside the repeater template
7. Click its content field
8. Click "+" button

**✅ VERIFY**: Magic Text Picker shows:
- ✅ "Current Item" category
- ✅ User category (singletons)
- ✅ Products table singleton options
- ✅ All categories appropriate for singletons

## Test 4: Empty States and Error Handling

### Test Empty Table
1. Drag new "Table" component
2. Don't set data source (leave empty)
3. Click "Preview"

**✅ VERIFY**:
- ✅ Shows "No data available"
- ✅ Shows "Set a data source in the properties panel"

### Test Empty Repeater
4. Go back to Builder
5. Drag new "Repeater" component
6. Set data source to `{{nonexistent}}`
7. Add a text child with `{{item.name}}`
8. Click "Preview"

**✅ VERIFY**:
- ✅ Shows "No data to display"

## Test 5: List Component

### Test Simple List
1. Go back to Builder
2. Drag "List" component
3. Click to select it
4. Set "Data Source" to `{{products}}`
5. Set "Display Field" to "name"
6. Click "Preview"

**✅ VERIFY**:
- ✅ Shows bulleted list
- ✅ Lists all product names
- ✅ Each item on separate line

## Success Criteria

### ✅ Data Type Validation
- [ ] Table components only accept collections
- [ ] Repeater components only accept collections  
- [ ] Text/Button components can accept singletons
- [ ] Magic text picker filters options by context

### ✅ Magic Text Processing
- [ ] {{products}} loads product collection
- [ ] {{item.name}} shows current item name in repeater
- [ ] {{item.price|currency}} formats as currency
- [ ] {{selectedProduct.name || "None"}} shows conditional text

### ✅ Preview Mode Functionality
- [ ] Tables display data with formatting
- [ ] Repeaters render all items with correct layout
- [ ] Button events work and update state
- [ ] Images load from magic text URLs
- [ ] Empty states show appropriate messages

### ✅ UI/UX Following Best Practices
- [ ] Magic text picker context-aware filtering
- [ ] Helper text guides user to correct syntax
- [ ] Component properties clearly organized
- [ ] Preview mode mirrors final app behavior

## Common Issues & Debugging

### If Magic Text Picker Doesn't Filter Correctly:
- Check dataType prop is passed to MagicTextEditor
- Verify MagicTextPicker receives dataType parameter
- Check validation logic in MagicTextProcessor

### If Preview Mode Shows Errors:
- Check console for JavaScript errors
- Verify table/collection names exist in database
- Check magic text syntax (double braces)

### If Data Doesn't Display:
- Verify table has data records
- Check column field names match data properties
- Ensure magic text expressions are valid

## Performance Notes
- Test with larger datasets (20+ records)
- Verify grid layouts render smoothly
- Check memory usage doesn't grow excessively
- Ensure button clicks remain responsive

## Final Validation
After completing all tests, the implementation should:
1. ✅ Follow industry-standard data binding patterns
2. ✅ Prevent common user errors through validation
3. ✅ Provide intuitive magic text picker experience
4. ✅ Handle edge cases gracefully
5. ✅ Perform well in preview mode with real data

**Test Status**: [ ] PASSED [ ] FAILED [ ] NEEDS REVISION