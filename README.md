# No-Code UI Builder

A professional drag-and-drop UI builder for creating React applications visually.

## Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3004
   ```

## How to Use

### First Time Setup
When you first open the app, it will automatically create a default app and page for you.

### Basic Workflow

1. **Drag Components**: 
   - From the left sidebar, drag components (Button, Text, Input, etc.) onto the canvas
   - Components will appear where you drop them

2. **Edit Properties**:
   - Click on any component in the canvas to select it
   - Use the right properties panel to edit text, styles, etc.

3. **Manage Pages**:
   - Click the "Pages" tab in the sidebar
   - Click "Add Page" to create new pages
   - Click on any page to switch to it

4. **Save Your Work**:
   - Click the "Save" button in the header
   - Your work is also auto-saved to localStorage

5. **Generate Code**:
   - Click the "Generate" button to create a React app
   - This requires the backend MCP server to be running

### Troubleshooting

**If drag and drop isn't working:**
1. Click the red X button in the header to clear all data
2. Refresh the page
3. The app will create a fresh default setup

**To run tests:**
```bash
npm test
```

**To run tests with UI:**
```bash
npm test -- --ui
```

## Features

- ✅ Drag and drop components
- ✅ Visual property editing
- ✅ Style editor with live preview
- ✅ Page management
- ✅ Data binding configuration
- ✅ Event handler setup
- ✅ Save and load projects
- ✅ Code generation (with backend)

## Architecture

- **React** with TypeScript
- **React DnD** for drag and drop
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Playwright** for testing
- **Vite** for bundling