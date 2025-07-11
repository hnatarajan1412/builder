import { App, Page, Table, Component } from '../types';

interface PersistenceData {
  apps: App[];
  pages: Record<string, Page[]>;
  tables: Record<string, Table[]>;
  components: Record<string, Component[]>;
}

class PersistenceService {
  private static instance: PersistenceService;
  private readonly STORAGE_KEY = 'nocode_builder_data';
  
  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  // Load all data from localStorage
  loadData(): PersistenceData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
    
    return {
      apps: [],
      pages: {},
      tables: {},
      components: {}
    };
  }

  // Save all data to localStorage
  saveData(data: PersistenceData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // App operations
  saveApp(app: App): void {
    const data = this.loadData();
    const index = data.apps.findIndex(a => a.id === app.id);
    
    if (index >= 0) {
      data.apps[index] = app;
    } else {
      data.apps.push(app);
    }
    
    this.saveData(data);
  }

  loadApps(): App[] {
    const data = this.loadData();
    return data.apps;
  }

  deleteApp(appId: string): void {
    const data = this.loadData();
    data.apps = data.apps.filter(a => a.id !== appId);
    
    // Also delete associated pages, tables, and components
    delete data.pages[appId];
    delete data.tables[appId];
    delete data.components[appId];
    
    this.saveData(data);
  }

  // Page operations
  savePage(page: Page): void {
    const data = this.loadData();
    
    if (!data.pages[page.appId]) {
      data.pages[page.appId] = [];
    }
    
    const index = data.pages[page.appId].findIndex(p => p.id === page.id);
    
    if (index >= 0) {
      data.pages[page.appId][index] = page;
    } else {
      data.pages[page.appId].push(page);
    }
    
    this.saveData(data);
  }

  loadPages(appId: string): Page[] {
    const data = this.loadData();
    return data.pages[appId] || [];
  }

  deletePage(appId: string, pageId: string): void {
    const data = this.loadData();
    
    if (data.pages[appId]) {
      data.pages[appId] = data.pages[appId].filter(p => p.id !== pageId);
    }
    
    this.saveData(data);
  }

  // Table operations
  saveTable(table: Table): void {
    const data = this.loadData();
    
    if (!data.tables[table.appId]) {
      data.tables[table.appId] = [];
    }
    
    const index = data.tables[table.appId].findIndex(t => t.id === table.id);
    
    if (index >= 0) {
      data.tables[table.appId][index] = table;
    } else {
      data.tables[table.appId].push(table);
    }
    
    this.saveData(data);
  }

  loadTables(appId: string): Table[] {
    const data = this.loadData();
    return data.tables[appId] || [];
  }

  // Load all tables (for shared database)
  loadAllTables(): Table[] {
    const data = this.loadData();
    const allTables: Table[] = [];
    
    Object.values(data.tables).forEach(tables => {
      allTables.push(...tables);
    });
    
    return allTables;
  }

  deleteTable(appId: string, tableId: string): void {
    const data = this.loadData();
    
    if (data.tables[appId]) {
      data.tables[appId] = data.tables[appId].filter(t => t.id !== tableId);
    }
    
    this.saveData(data);
  }

  // Component operations (for custom components)
  saveComponent(component: Component): void {
    const data = this.loadData();
    const appId = 'global'; // Global components for now
    
    if (!data.components[appId]) {
      data.components[appId] = [];
    }
    
    const index = data.components[appId].findIndex(c => c.id === component.id);
    
    if (index >= 0) {
      data.components[appId][index] = component;
    } else {
      data.components[appId].push(component);
    }
    
    this.saveData(data);
  }

  loadComponents(): Component[] {
    const data = this.loadData();
    return data.components['global'] || [];
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const persistenceService = PersistenceService.getInstance();