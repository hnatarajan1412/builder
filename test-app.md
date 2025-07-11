# Testing the UI Builder

## Access the App
Open your browser and go to: http://localhost:3004

## Expected Behavior

1. **On First Load:**
   - You should see a canvas with "Drop components here to start building"
   - The left sidebar should show the Components tab with draggable components
   - The app name "My App" and page name "Home" should appear in the header

2. **Drag and Drop Test:**
   - Drag a "Button" component from the left sidebar
   - Drop it onto the canvas
   - The button should appear on the canvas
   - Click the button to select it
   - The properties panel should appear on the right

3. **Page Management:**
   - Click the "Pages" tab in the left sidebar
   - You should see "Home" page listed
   - Click "Add Page" to create a new page

## Troubleshooting

If drag and drop doesn't work:
1. Open browser console (F12)
2. Look for any error messages
3. Click the red X button in header to reset
4. Refresh the page

## Console Commands for Debugging

```javascript
// Check current app
JSON.parse(localStorage.getItem('currentApp'))

// Check current page
JSON.parse(localStorage.getItem('currentPage'))

// Clear everything
localStorage.clear()
```