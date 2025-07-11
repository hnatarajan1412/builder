# NoCode Builder - File Ledger and Documentation

This document provides a comprehensive overview of all files in the project, their purposes, and identifies any duplicates or consolidation opportunities.

## ✅ Consolidation Complete

### 1. Database Services (RESOLVED)
- **REMOVED:** `src/services/database.service.ts` - Original in-memory database 
- **ACTIVE:** `src/services/hybrid-database.service.ts` - Hybrid approach using PostgreSQL + localStorage
- **COMPAT:** `src/services/database-compat.service.ts` - Compatibility wrapper for smooth migration
- **Status:** All imports updated to use database-compat.service for backward compatibility

### 2. Side Panel Components (RESOLVED)
- **REMOVED:** `src/components/SidePanel.tsx` - Basic side panel
- **ACTIVE:** `src/components/EnhancedSidePanel.tsx` - Enhanced version with more features
- **Status:** Old component removed, only enhanced version in use

### 3. Data Panel Components (RESOLVED)
- **REMOVED:** `src/components/DataPanel.tsx` - Basic data panel
- **ACTIVE:** `src/components/EnhancedDataPanel.tsx` - Enhanced version
- **Status:** Old component removed, only enhanced version in use

### 4. Header Components (RESOLVED)
- **REMOVED:** `src/components/Header.tsx` - Unused header component
- **ACTIVE:** `src/components/AppHeader.tsx` - Active header with app selector
- **Status:** Unused component removed

### 5. Property Panel Components (NO DUPLICATE)
- `src/components/PropertiesPanel.tsx` - Main container for property editing
- `src/components/PropertyPanel.tsx` - Component that renders specific property editors
- `src/components/PropertyEditor.tsx` - Individual property editor component
- **Status:** These work together in a hierarchy, not duplicates

## 📁 Services Directory

### Database Services
- `database.service.ts` ❌ **[REMOVED]** - Old in-memory database (migrated)

- `database-compat.service.ts` ✅ **[ACTIVE]** - Compatibility wrapper
  - Provides synchronous API matching old database.service
  - Wraps hybrid-database.service calls
  - All components now use this for backward compatibility
  - Will be phased out once all components are updated to async

- `hybrid-database.service.ts` ✅ **[ACTIVE]** - New hybrid database (PostgreSQL + localStorage)
  - Uses PostgreSQL for data, localStorage for schemas
  - Async methods with sync fallbacks for preview mode
  - Added compatibility methods: initializeApp, dropTable, query, insertSync, etc.
  - Primary database service for new development

- `postgres.service.ts` - PostgreSQL connection service
  - Handles actual database operations
  - Used by hybrid-database.service

- `persistence.service.ts` - App state persistence
  - Saves/loads app configurations
  - Handles component state persistence

## 📁 Components Directory

### Core UI Components
- `App.tsx` - Main application component
- `Canvas.tsx` - Main canvas for drag-and-drop
- `ComponentRenderer.tsx` - Renders components based on type
- `EmptyCanvas.tsx` - Empty state for canvas
- `Header.tsx` ❌ **[REMOVED]** - Unused application header
- `AppHeader.tsx` - Actual header component with app selector
- `Sidebar.tsx` - Main sidebar container

### Side Panels
- `SidePanel.tsx` ❌ **[REMOVED]** - Basic side panel (migrated)
- `EnhancedSidePanel.tsx` ✅ **[ACTIVE]** - Enhanced side panel with tabs

### Data Management Components
- `DataPanel.tsx` ❌ **[REMOVED]** - Basic data panel (migrated)
- `EnhancedDataPanel.tsx` ✅ **[ACTIVE]** - Enhanced data panel with better UI
- `DataManager.tsx` - Table data CRUD operations
- `TableDataViewer.tsx` - View table data in preview
- `TableColumnManager.tsx` - Manage table columns

### Property Editing (POTENTIAL DUPLICATES)
- `PropertiesPanel.tsx` - Component properties panel
- `PropertyPanel.tsx` - Another property panel (check for duplication)
- `PropertyEditor.tsx` - Individual property editor
- `StyleEditor.tsx` - Style-specific properties

### Data Binding Components
- `DataBindingEditor.tsx` - Main data binding editor
- `DataBindingPanel.tsx` - Data binding panel
- `VisualDataBinding.tsx` - Visual drag-drop binding
- `binding/DataSourceExplorer.tsx` - Explore data sources
- `binding/DynamicBindingEditor.tsx` - Dynamic binding editor
- `binding/ExpressionInput.tsx` - Expression input field

### Magic Text Components
- `MagicTextEditor.tsx` - Magic text editor
- `MagicTextPicker.tsx` - Pick magic text values
- `MagicTextFormatPanel.tsx` - Format magic text

### Formula Components
- `FormulaBuilder.tsx` - Build formulas visually
- `FormulaEditor.tsx` - Edit formulas

### Form Components
- `FormComponent.tsx` - Form container component
- `FormPropertiesPanel.tsx` - Form-specific properties
- `EnhancedInputComponent.tsx` - Enhanced input field

### Other Components
- `ActionEditor.tsx` - Edit component actions
- `AlignmentTools.tsx` - Alignment tools
- `AppSelector.tsx` - Select/switch apps
- `Breadcrumb.tsx` - Navigation breadcrumb
- `ComponentMarketplace.tsx` - Browse components
- `ComponentPalette.tsx` - Drag components from here
- `EventsEditor.tsx` - Edit component events
- `NavigationComponent.tsx` - Navigation component
- `PagesPanel.tsx` - Manage app pages
- `PreviewMode.tsx` - Preview mode viewer
- `RepeaterComponent.tsx` - Repeater/list component
- `RepeaterPropertiesPanel.tsx` - Repeater properties
- `ResponsiveControls.tsx` - Responsive design controls
- `UndoRedoControls.tsx` - Undo/redo buttons
- `UserContextPanel.tsx` - User context info
- `ViewportControls.tsx` - Viewport controls

## 📁 Stores Directory

- `builder.store.ts` - Main builder state (components, pages, etc.)
- `app-state.store.ts` - Application state
- `history.store.ts` - Undo/redo history
- `user.store.ts` - User authentication state

## 📁 Utils Directory

- `formulaEvaluator.ts` - Evaluate formulas
- `magicTextFormatter.ts` - Format magic text
- `magicTextProcessor.ts` - Process magic text expressions

## 📁 Types Directory

- `index.ts` - Main type definitions
- `binding.types.ts` - Data binding types

## 📁 Hooks Directory

- `useKeyboardShortcuts.ts` - Keyboard shortcut handling

## 📁 Tests Directory

Contains various test files for different features.

## 📁 Scripts Directory

- `create-online-store-demo.ts` - Creates demo store

## ✅ Migration Complete

All files have been updated to use the new database-compat.service.ts which provides backward compatibility while using the hybrid database service under the hood.

## 🎯 Next Steps

1. **Phase Out Compatibility Layer:**
   - Gradually update components to use async methods from hybrid-database.service
   - Remove database-compat.service once all components are updated

2. **Component Naming:**
   - Consider renaming "Enhanced" components to remove the prefix
   - EnhancedSidePanel → SidePanel
   - EnhancedDataPanel → DataPanel

3. **Testing:**
   - Ensure all tests pass with the new database service
   - Update tests to use async methods where appropriate

4. **Documentation:**
   - Add JSDoc comments to all service methods
   - Create migration guide for developers