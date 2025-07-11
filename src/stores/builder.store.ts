import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { App, Page, Component, ComponentInstance, Table } from '../types';
import { ViewportSize } from '../components/ViewportControls';
import { useHistoryStore } from './history.store';
import { hybridDatabaseService } from '../services/hybrid-database.service';
import { persistenceService } from '../services/persistence.service';

interface BuilderState {
  // Current selections
  currentApp: App | null;
  currentPage: Page | null;
  selectedComponent: ComponentInstance | null;
  
  // Data
  apps: App[];
  pages: Record<string, Page>;
  components: Record<string, Component>;
  tables: Record<string, Table>;
  
  // UI State
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  sidebarTab: 'components' | 'pages' | 'data' | 'settings';
  sidePanelMode: 'components' | 'database' | 'table-data' | 'pages' | 'settings' | null;
  selectedTable: string | null;
  propertiesPanel: boolean;
  viewport: ViewportSize;
  
  // Actions
  setCurrentApp: (app: App | null) => void;
  setCurrentPage: (page: Page | null) => void;
  selectComponent: (component: ComponentInstance | null) => void;
  initializePage: (page: Page) => void;
  
  addComponentToPage: (component: ComponentInstance, parentId?: string) => void;
  updateComponentProps: (componentId: string, props: Record<string, any>) => void;
  updateComponentStyle: (componentId: string, style: Record<string, any>) => void;
  updateComponentResponsiveStyles: (componentId: string, responsiveStyles: Record<string, any>) => void;
  updateComponentBinding: (componentId: string, property: string, binding: any) => void;
  updateComponentBindings: (componentId: string, bindings: Record<string, any>) => void;
  updateComponentEvents: (componentId: string, events: any[]) => void;
  removeComponent: (componentId: string) => void;
  duplicateComponent: (componentId: string) => void;
  
  moveComponent: (componentId: string, newParentId?: string, index?: number) => void;
  
  setSidebarTab: (tab: 'components' | 'pages' | 'data' | 'settings') => void;
  setSidePanelMode: (mode: 'components' | 'database' | 'table-data' | 'pages' | 'settings' | null) => void;
  setSelectedTable: (tableId: string | null) => void;
  togglePropertiesPanel: () => void;
  setViewport: (viewport: ViewportSize) => void;
  
  setDragging: (isDragging: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  
  // Data management
  createApp: (app: Omit<App, 'id'>) => Promise<App>;
  updateApp: (appId: string, updates: Partial<App>) => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
  loadApp: (appId: string) => Promise<void>;
  
  createPage: (page: Omit<Page, 'id'>) => Promise<Page>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  
  createComponent: (component: Omit<Component, 'id'>) => Promise<Component>;
  updateComponent: (componentId: string, updates: Partial<Component>) => Promise<void>;
  deleteComponent: (componentId: string) => Promise<void>;
  
  createTable: (table: Omit<Table, 'id'>) => Promise<Table>;
  updateTable: (tableId: string, updates: Partial<Table>) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set, get) => {
      // Load persisted data on initialization
      const loadPersistedData = () => {
        const apps = persistenceService.loadApps();
        const allTables = persistenceService.loadAllTables();
        const tables: Record<string, Table> = {};
        allTables.forEach(table => {
          tables[table.id] = table;
        });
        
        // Load pages for all apps
        const pages: Record<string, Page> = {};
        apps.forEach(app => {
          const appPages = persistenceService.loadPages(app.id);
          appPages.forEach(page => {
            pages[page.id] = page;
          });
        });
        
        return { apps, pages, tables };
      };
      
      const persistedData = loadPersistedData();
      
      return {
      // Initial state
      currentApp: null,
      currentPage: null,
      selectedComponent: null,
      apps: persistedData.apps,
      pages: persistedData.pages,
      components: {},
      tables: persistedData.tables,
      isDragging: false,
      isLoading: false,
      error: null,
      sidebarTab: 'components',
      sidePanelMode: null,
      selectedTable: null,
      propertiesPanel: true,
      viewport: 'full',
      
      // Actions
      setCurrentApp: (app) => {
        set({ currentApp: app });
        if (app) {
          // Load pages for this app
          const appPages = persistenceService.loadPages(app.id);
          const pagesMap: Record<string, Page> = {};
          appPages.forEach(page => {
            pagesMap[page.id] = page;
          });
          set(state => ({
            pages: { ...state.pages, ...pagesMap }
          }));
        }
      },
      setCurrentPage: (page) => set({ currentPage: page, selectedComponent: null }),
      selectComponent: (component) => set({ selectedComponent: component }),
      initializePage: (page) => {
        set({ 
          pages: { ...get().pages, [page.id]: page }
        });
      },
      
      addComponentToPage: (component, parentId) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history before making changes
        useHistoryStore.getState().pushHistory(currentPage);
        
        const newPage = { ...currentPage };
        
        if (parentId) {
          // Find parent and add to its children
          const findAndAdd = (components: ComponentInstance[]): boolean => {
            for (const comp of components) {
              if (comp.id === parentId) {
                if (!comp.children) comp.children = [];
                comp.children.push(component);
                return true;
              }
              if (comp.children && findAndAdd(comp.children)) {
                return true;
              }
            }
            return false;
          };
          
          findAndAdd(newPage.components);
        } else {
          newPage.components.push(component);
        }
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentProps: (componentId, props) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateProps = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              comp.props = { ...comp.props, ...props };
              return true;
            }
            if (comp.children && updateProps(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateProps(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentStyle: (componentId, style) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateStyle = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              comp.style = { ...comp.style, ...style };
              return true;
            }
            if (comp.children && updateStyle(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateStyle(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentResponsiveStyles: (componentId, responsiveStyles) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateResponsiveStyles = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              comp.responsiveStyles = responsiveStyles;
              return true;
            }
            if (comp.children && updateResponsiveStyles(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateResponsiveStyles(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentBinding: (componentId, property, binding) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateBinding = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              if (!comp.bindings) comp.bindings = {};
              comp.bindings[property] = binding;
              return true;
            }
            if (comp.children && updateBinding(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateBinding(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentBindings: (componentId, bindings) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateBindings = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              comp.bindings = bindings;
              return true;
            }
            if (comp.children && updateBindings(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateBindings(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      updateComponentEvents: (componentId, events) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const updateEvents = (components: ComponentInstance[]): boolean => {
          for (const comp of components) {
            if (comp.id === componentId) {
              comp.events = events;
              return true;
            }
            if (comp.children && updateEvents(comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        updateEvents(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
      },
      
      removeComponent: (componentId) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        const removeFromComponents = (components: ComponentInstance[]): ComponentInstance[] => {
          return components.filter(comp => {
            if (comp.id === componentId) return false;
            if (comp.children) {
              comp.children = removeFromComponents(comp.children);
            }
            return true;
          });
        };
        
        const newPage = { ...currentPage };
        newPage.components = removeFromComponents(newPage.components);
        
        set({ 
          currentPage: newPage,
          pages: { ...get().pages, [newPage.id]: newPage },
          selectedComponent: null
        });
      },
      
      duplicateComponent: (componentId) => {
        const { currentPage } = get();
        if (!currentPage) return;
        
        // Save current state to history
        useHistoryStore.getState().pushHistory(currentPage);
        
        // Deep clone helper
        const cloneComponent = (comp: ComponentInstance): ComponentInstance => {
          const cloned: ComponentInstance = {
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            componentId: comp.componentId,
            props: { ...comp.props },
            style: { ...comp.style },
            bindings: comp.bindings ? { ...comp.bindings } : undefined,
            events: comp.events ? [...comp.events] : undefined,
            children: comp.children ? comp.children.map(cloneComponent) : undefined
          };
          return cloned;
        };
        
        // Find component and its parent
        let componentToDuplicate: ComponentInstance | null = null;
        let parentComponents: ComponentInstance[] | null = null;
        let componentIndex = -1;
        
        const findComponent = (components: ComponentInstance[], parent: ComponentInstance[] | null = null): boolean => {
          for (let i = 0; i < components.length; i++) {
            const comp = components[i];
            if (comp.id === componentId) {
              componentToDuplicate = comp;
              parentComponents = parent || components;
              componentIndex = i;
              return true;
            }
            if (comp.children && findComponent(comp.children, comp.children)) {
              return true;
            }
          }
          return false;
        };
        
        const newPage = { ...currentPage };
        findComponent(newPage.components);
        
        if (componentToDuplicate && parentComponents) {
          const cloned = cloneComponent(componentToDuplicate);
          // Insert after the original
          parentComponents.splice(componentIndex + 1, 0, cloned);
          
          set({ 
            currentPage: newPage,
            pages: { ...get().pages, [newPage.id]: newPage },
            selectedComponent: cloned
          });
          
          // Persist page
          persistenceService.savePage(newPage);
        }
      },
      
      moveComponent: () => {
        // Implementation for drag and drop reordering
        // TODO: Implement component moving logic
      },
      
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setSidePanelMode: (mode) => set({ sidePanelMode: mode }),
      setSelectedTable: (tableId) => set({ selectedTable: tableId }),
      togglePropertiesPanel: () => set({ propertiesPanel: !get().propertiesPanel }),
      setViewport: (viewport) => set({ viewport }),
      
      setDragging: (isDragging) => set({ isDragging }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Undo/Redo
      undo: () => {
        const historyEntry = useHistoryStore.getState().undo();
        if (historyEntry) {
          const { page } = historyEntry;
          set({ 
            currentPage: page,
            pages: { ...get().pages, [page.id]: page }
          });
          persistenceService.savePage(page);
        }
      },
      
      redo: () => {
        const historyEntry = useHistoryStore.getState().redo();
        if (historyEntry) {
          const { page } = historyEntry;
          set({ 
            currentPage: page,
            pages: { ...get().pages, [page.id]: page }
          });
          persistenceService.savePage(page);
        }
      },
      
      // API calls
      createApp: async (appData) => {
        const newApp: App = {
          ...appData,
          id: `app-${Date.now()}`,
        };
        
        set(state => ({ 
          apps: [...state.apps, newApp],
          currentApp: newApp
        }));
        
        // Persist app
        persistenceService.saveApp(newApp);
        
        // Create default page for the app
        const defaultPage: Page = {
          id: `page-${Date.now()}`,
          appId: newApp.id,
          name: 'Dashboard',
          components: [],
          path: '/dashboard'
        };
        
        set(state => ({
          pages: { ...state.pages, [defaultPage.id]: defaultPage }
        }));
        
        persistenceService.savePage(defaultPage);
        
        return newApp;
      },
      
      updateApp: async (appId, updates) => {
        const app = get().apps.find(a => a.id === appId);
        if (!app) return;
        
        const updatedApp = { ...app, ...updates };
        set(state => ({ 
          apps: state.apps.map(a => a.id === appId ? updatedApp : a)
        }));
        
        if (get().currentApp?.id === appId) {
          set({ currentApp: updatedApp });
        }
        
        // Persist app
        persistenceService.saveApp(updatedApp);
      },
      
      deleteApp: async (appId) => {
        set(state => ({ 
          apps: state.apps.filter(a => a.id !== appId)
        }));
        
        if (get().currentApp?.id === appId) {
          set({ currentApp: null });
        }
        
        // Delete from persistence
        persistenceService.deleteApp(appId);
      },
      
      loadApp: async (appId) => {
        set({ isLoading: true, error: null });
        try {
          const apps = persistenceService.loadApps();
          const app = apps.find(a => a.id === appId);
          if (app) {
            const pages = persistenceService.loadPages(appId);
            const tables = persistenceService.loadTables(appId);
            
            const pagesMap: Record<string, Page> = {};
            pages.forEach(page => {
              pagesMap[page.id] = page;
            });
            
            const tablesMap: Record<string, Table> = {};
            tables.forEach(table => {
              tablesMap[table.id] = table;
            });
            
            set(state => ({
              currentApp: app,
              pages: { ...state.pages, ...pagesMap },
              tables: { ...state.tables, ...tablesMap },
              isLoading: false
            }));
          } else {
            set({ error: 'App not found', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      createPage: async (pageData) => {
        const newPage: Page = {
          ...pageData,
          id: `page-${Date.now()}`,
          components: [],
        };
        
        set({ 
          pages: { ...get().pages, [newPage.id]: newPage }
        });
        
        // Persist page
        persistenceService.savePage(newPage);
        
        return newPage;
      },
      
      updatePage: async (pageId, updates) => {
        const page = get().pages[pageId];
        if (!page) return;
        
        const updatedPage = { ...page, ...updates };
        set({ 
          pages: { ...get().pages, [pageId]: updatedPage }
        });
        
        if (get().currentPage?.id === pageId) {
          set({ currentPage: updatedPage });
        }
        
        // Persist page
        persistenceService.savePage(updatedPage);
      },
      
      deletePage: async (pageId) => {
        const { pages } = get();
        const page = pages[pageId];
        if (!page) return;
        
        const newPages = { ...pages };
        delete newPages[pageId];
        
        set({ pages: newPages });
        
        if (get().currentPage?.id === pageId) {
          set({ currentPage: null });
        }
        
        // Delete from persistence
        persistenceService.deletePage(page.appId, pageId);
      },
      
      createComponent: async (componentData) => {
        const newComponent: Component = {
          ...componentData,
          id: `comp-${Date.now()}`,
        };
        
        set({ 
          components: { ...get().components, [newComponent.id]: newComponent }
        });
        
        return newComponent;
      },
      
      updateComponent: async (componentId, updates) => {
        const component = get().components[componentId];
        if (!component) return;
        
        const updatedComponent = { ...component, ...updates };
        set({ 
          components: { ...get().components, [componentId]: updatedComponent }
        });
      },
      
      deleteComponent: async (componentId) => {
        const { components } = get();
        const newComponents = { ...components };
        delete newComponents[componentId];
        
        set({ components: newComponents });
      },
      
      createTable: async (tableData) => {
        const newTable: Table = {
          ...tableData,
          id: `table-${Date.now()}`,
        };
        
        // Create table in hybrid database service
        if (tableData.appId) {
          await hybridDatabaseService.createTable(tableData.appId, newTable);
        }
        
        set({ 
          tables: { ...get().tables, [newTable.id]: newTable }
        });
        
        // Persist table
        persistenceService.saveTable(newTable);
        
        return newTable;
      },
      
      updateTable: async (tableId, updates) => {
        const table = get().tables[tableId];
        if (!table) return;
        
        const oldTable = { ...table };
        const updatedTable = { ...table, ...updates };
        set({ 
          tables: { ...get().tables, [tableId]: updatedTable }
        });
        
        // Persist table
        persistenceService.saveTable(updatedTable);
        
        // Sync with hybrid database if schema changed
        if (updates.fields || updates.relationships) {
          await hybridDatabaseService.updateTable(table.appId, oldTable, updatedTable);
        }
      },
      
      deleteTable: async (tableId) => {
        const { tables } = get();
        const table = tables[tableId];
        if (!table) return;
        
        const newTables = { ...tables };
        delete newTables[tableId];
        
        set({ tables: newTables });
        
        // Delete from persistence
        persistenceService.deleteTable(table.appId, tableId);
        
        // Delete from hybrid database (both schema and data)
        await hybridDatabaseService.deleteTable(table.appId, table.name);
      },
    };
    }
  )
);