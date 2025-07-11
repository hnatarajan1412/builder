// Hybrid Database Service
// - Uses PostgreSQL for actual table data (CRUD operations)
// - Uses localStorage for app structure, pages, and table schemas
// This provides the best of both worlds: persistence + performance

import { Table } from '../types';
import { postgresService } from './postgres.service';
import { v4 as uuidv4 } from 'uuid';

interface QueryResult {
  rows: any[];
  columns: string[];
}

interface DatabaseRecord {
  [key: string]: any;
}

export class HybridDatabaseService {
  private static instance: HybridDatabaseService;
  private readonly SCHEMA_STORAGE_KEY = 'nocode_table_schemas';
  
  private constructor() {}
  
  static getInstance(): HybridDatabaseService {
    if (!HybridDatabaseService.instance) {
      HybridDatabaseService.instance = new HybridDatabaseService();
    }
    return HybridDatabaseService.instance;
  }

  // Initialize the hybrid system
  async initialize(): Promise<boolean> {
    console.log('🔄 Initializing Hybrid Database Service...');
    
    // Initialize PostgreSQL connection
    const pgResult = await postgresService.initialize();
    
    if (pgResult) {
      console.log('✅ PostgreSQL connected for data storage');
    } else {
      console.log('⚠️  PostgreSQL not available, using localStorage fallback');
    }
    
    console.log('✅ Schema storage via localStorage ready');
    return true;
  }

  // Create table: Schema in localStorage, actual table in PostgreSQL
  async createTable(appId: string, table: Table): Promise<boolean> {
    try {
      // 1. Save table schema to localStorage
      this.saveTableSchema(appId, table);
      
      // 2. Create actual table in PostgreSQL
      // Convert fields array to object format expected by postgres service
      const fieldsObject: Record<string, any> = {};
      if (Array.isArray(table.fields)) {
        table.fields.forEach(field => {
          fieldsObject[field.name] = {
            type: field.type,
            required: field.required,
            unique: field.unique,
            primaryKey: field.primaryKey,
            defaultValue: field.defaultValue
          };
        });
      }
      const pgSuccess = await postgresService.createTable(appId, table.name, fieldsObject);
      
      if (pgSuccess) {
        console.log(`✅ Table '${table.name}' created successfully`);
        console.log(`   📊 Data: PostgreSQL`);
        console.log(`   📋 Schema: localStorage`);
      }
      
      return pgSuccess;
    } catch (error) {
      console.error('Error creating table:', error);
      return false;
    }
  }

  // Insert data: Store in PostgreSQL
  async insert(appId: string, tableName: string, data: DatabaseRecord): Promise<DatabaseRecord | null> {
    // Auto-generate UUIDs for UUID fields
    const schema = this.getTableSchema(appId, tableName);
    if (schema && schema.fields) {
      const enhancedData = { ...data };
      
      // Generate UUIDs for UUID fields that are empty or undefined
      if (Array.isArray(schema.fields)) {
        schema.fields.forEach(field => {
          if (field.type === 'uuid' && !enhancedData[field.name]) {
            enhancedData[field.name] = uuidv4();
          }
        });
      }
      
      return await postgresService.insert(appId, tableName, enhancedData);
    }
    
    return await postgresService.insert(appId, tableName, data);
  }

  // Query data: Retrieve from PostgreSQL
  async query(appId: string, tableName: string, conditions?: any): Promise<QueryResult> {
    return await postgresService.query(appId, tableName, conditions);
  }

  // Update data: Update in PostgreSQL
  async update(appId: string, tableName: string, id: any, updates: DatabaseRecord): Promise<boolean> {
    return await postgresService.update(appId, tableName, id, updates);
  }

  // Delete data: Delete from PostgreSQL
  async delete(appId: string, tableName: string, id: any): Promise<boolean> {
    return await postgresService.delete(appId, tableName, id);
  }

  // Get all data: Retrieve from PostgreSQL
  async getAllData(appId: string, tableName: string): Promise<DatabaseRecord[]> {
    return await postgresService.getAllData(appId, tableName);
  }

  // Synchronous fallback for preview mode - uses localStorage cache
  getAllDataSync(appId: string, tableName: string): DatabaseRecord[] {
    try {
      // Try localStorage fallback first (used by PostgreSQL service)
      const storageKey = `postgres_fallback_${appId}_${tableName}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error getting sync data:', error);
      return [];
    }
  }

  // Synchronous query fallback for preview mode
  querySync(appId: string, tableName: string, conditions?: any): QueryResult {
    try {
      const data = this.getAllDataSync(appId, tableName);
      let rows = [...data];
      
      // Apply simple conditions if provided
      if (conditions) {
        rows = rows.filter(row => {
          return Object.entries(conditions).every(([key, value]) => row[key] === value);
        });
      }
      
      // Get columns from first row or empty array
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      
      return { rows, columns };
    } catch (error) {
      console.error('Error in sync query:', error);
      return { rows: [], columns: [] };
    }
  }

  // Clear table: Clear PostgreSQL data
  async clearTable(appId: string, tableName: string): Promise<boolean> {
    return await postgresService.clearTable(appId, tableName);
  }

  // Schema management: localStorage operations
  
  // Save table schema to localStorage
  private saveTableSchema(appId: string, table: Table): void {
    try {
      const schemas = this.loadAllSchemas();
      if (!schemas[appId]) {
        schemas[appId] = {};
      }
      schemas[appId][table.name] = table;
      localStorage.setItem(this.SCHEMA_STORAGE_KEY, JSON.stringify(schemas));
    } catch (error) {
      console.error('Error saving table schema:', error);
    }
  }

  // Load table schema from localStorage
  getTableSchema(appId: string, tableName: string): Table | null {
    try {
      const schemas = this.loadAllSchemas();
      return schemas[appId]?.[tableName] || null;
    } catch (error) {
      console.error('Error loading table schema:', error);
      return null;
    }
  }

  // Get all table schemas for an app
  getAppTableSchemas(appId: string): Record<string, Table> {
    try {
      const schemas = this.loadAllSchemas();
      return schemas[appId] || {};
    } catch (error) {
      console.error('Error loading app schemas:', error);
      return {};
    }
  }

  // Load all schemas from localStorage
  private loadAllSchemas(): Record<string, Record<string, Table>> {
    try {
      const stored = localStorage.getItem(this.SCHEMA_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading schemas from localStorage:', error);
      return {};
    }
  }

  // Get table fields for column detection (used by TableColumnManager)
  getTableFields(appId: string, tableName: string): Array<{ name: string; type: string; label: string }> {
    // First try to get from schema
    const schema = this.getTableSchema(appId, tableName);
    if (schema && schema.fields) {
      if (Array.isArray(schema.fields)) {
        return schema.fields.map(field => ({
          name: field.name,
          type: field.type || 'text',
          label: field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1)
        }));
      } else {
        // Fallback for old object format
        return Object.entries(schema.fields).map(([fieldName, fieldDef]: [string, any]) => ({
          name: fieldName,
          type: fieldDef.type || 'text',
          label: fieldDef.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        }));
      }
    }

    // If no schema, this will be handled by async data loading
    return [];
  }

  // Get table fields from actual data (fallback when no schema)
  async getTableFieldsFromData(appId: string, tableName: string): Promise<Array<{ name: string; type: string; label: string }>> {
    try {
      const data = await this.getAllData(appId, tableName);
      if (data && data.length > 0) {
        const sampleRecord = data[0];
        return Object.keys(sampleRecord)
          .filter(key => !['id', 'created_at', 'updated_at'].includes(key)) // Exclude system fields
          .map(fieldName => {
            const value = sampleRecord[fieldName];
            let type = 'text';

            // Infer type from sample data
            if (typeof value === 'number') {
              type = 'number';
            } else if (typeof value === 'boolean') {
              type = 'boolean';
            } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
              type = 'date';
            } else if (typeof value === 'string' && value.startsWith('http')) {
              type = value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'url';
            }

            return {
              name: fieldName,
              type,
              label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
            };
          });
      }
      return [];
    } catch (error) {
      console.error('Error getting fields from data:', error);
      return [];
    }
  }

  // Update table: Update schema and sync with PostgreSQL
  async updateTable(appId: string, oldTable: Table, newTable: Table): Promise<boolean> {
    try {
      // 1. Update schema in localStorage
      this.saveTableSchema(appId, newTable);
      
      // 2. Sync changes with PostgreSQL
      const fieldsObject: Record<string, any> = {};
      if (Array.isArray(newTable.fields)) {
        newTable.fields.forEach(field => {
          fieldsObject[field.name] = {
            type: field.type,
            required: field.required,
            unique: field.unique,
            primaryKey: field.primaryKey,
            defaultValue: field.defaultValue
          };
        });
      }
      
      // Update table structure in PostgreSQL
      const pgSuccess = await postgresService.updateTableSchema(
        appId, 
        newTable.name, 
        fieldsObject,
        newTable.relationships || []
      );
      
      if (pgSuccess) {
        console.log(`✅ Table '${newTable.name}' updated successfully`);
        console.log(`   📊 Data: PostgreSQL updated`);
        console.log(`   📋 Schema: localStorage updated`);
      }
      
      return pgSuccess;
    } catch (error) {
      console.error('Error updating table:', error);
      return false;
    }
  }

  // Delete table: Remove schema and data
  async deleteTable(appId: string, tableName: string): Promise<boolean> {
    try {
      // 1. Remove schema from localStorage
      const schemas = this.loadAllSchemas();
      if (schemas[appId] && schemas[appId][tableName]) {
        delete schemas[appId][tableName];
        localStorage.setItem(this.SCHEMA_STORAGE_KEY, JSON.stringify(schemas));
      }

      // 2. Drop table from PostgreSQL
      await postgresService.dropTable(appId, tableName);

      console.log(`✅ Table '${tableName}' deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting table:', error);
      return false;
    }
  }

  // Initialize app (compatibility method from old service)
  initializeApp(appId: string): void {
    // In hybrid service, initialization happens automatically
    // This method exists for backward compatibility
    console.log(`App ${appId} initialized (compatibility mode)`);
  }

  // Drop table (alias for deleteTable for compatibility)
  async dropTable(appId: string, tableName: string): Promise<void> {
    await this.deleteTable(appId, tableName);
  }

  // Alias methods for backward compatibility
  async getData(appId: string, tableName: string): Promise<DatabaseRecord[]> {
    return await this.getAllData(appId, tableName);
  }

  async insertData(appId: string, tableName: string, data: DatabaseRecord): Promise<DatabaseRecord> {
    const result = await this.insert(appId, tableName, data);
    return result || data; // Return original data if insert fails
  }

  async updateData(appId: string, tableName: string, id: any, updates: DatabaseRecord): Promise<boolean> {
    return await this.update(appId, tableName, id, updates);
  }

  async deleteData(appId: string, tableName: string, id: any): Promise<boolean> {
    return await this.delete(appId, tableName, id);
  }


  // Synchronous insert method for backward compatibility
  insertSync(appId: string, tableName: string, data: DatabaseRecord): DatabaseRecord {
    // Auto-generate ID if not provided
    const record = {
      id: data.id || Date.now(),
      ...data
    };

    // Store in localStorage fallback
    const storageKey = `postgres_fallback_${appId}_${tableName}`;
    const existingData = this.getAllDataSync(appId, tableName);
    existingData.push(record);
    localStorage.setItem(storageKey, JSON.stringify(existingData));

    // Queue async insert
    this.insert(appId, tableName, record).catch(err => 
      console.error('Async insert failed:', err)
    );

    return record;
  }

  // Synchronous update method for backward compatibility
  updateSync(appId: string, tableName: string, id: any, updates: DatabaseRecord): boolean {
    const storageKey = `postgres_fallback_${appId}_${tableName}`;
    const data = this.getAllDataSync(appId, tableName);
    const index = data.findIndex(row => row.id === id);
    
    if (index === -1) return false;
    
    data[index] = { ...data[index], ...updates };
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Queue async update
    this.update(appId, tableName, id, updates).catch(err => 
      console.error('Async update failed:', err)
    );

    return true;
  }

  // Synchronous delete method for backward compatibility
  deleteSync(appId: string, tableName: string, id: any): boolean {
    const storageKey = `postgres_fallback_${appId}_${tableName}`;
    const data = this.getAllDataSync(appId, tableName);
    const index = data.findIndex(row => row.id === id);
    
    if (index === -1) return false;
    
    data.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Queue async delete
    this.delete(appId, tableName, id).catch(err => 
      console.error('Async delete failed:', err)
    );

    return true;
  }

  // Synchronous createTable for backward compatibility
  createTableSync(appId: string, table: Table): void {
    // Save schema synchronously
    this.saveTableSchema(appId, table);
    
    // Initialize empty data in localStorage
    const storageKey = `postgres_fallback_${appId}_${table.name}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify([]));
    }

    // Queue async table creation
    this.createTable(appId, table).catch(err => 
      console.error('Async createTable failed:', err)
    );
  }

  // Migration helper: Seed test data for development
  async seedTestData(appId: string, table: Table, recordCount: number = 5): Promise<boolean> {
    try {
      console.log(`🌱 Seeding test data for table '${table.name}'...`);
      
      for (let i = 1; i <= recordCount; i++) {
        const testRecord: DatabaseRecord = {};
        
        // Generate test data based on field types
        if (Array.isArray(table.fields)) {
          table.fields.forEach(field => {
            testRecord[field.name] = this.generateTestValue(field.type || 'text', field.name, i);
          });
        } else if (table.fields) {
          // Fallback for old object format
          Object.entries(table.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
            testRecord[fieldName] = this.generateTestValue(fieldDef.type || 'text', fieldName, i);
          });
        } else {
          // Default test fields if no schema
          testRecord.name = `Test Item ${i}`;
          testRecord.description = `Description for test item ${i}`;
        }

        await this.insert(appId, table.name, testRecord);
      }

      console.log(`✅ Seeded ${recordCount} test records for '${table.name}'`);
      return true;
    } catch (error) {
      console.error('Error seeding test data:', error);
      return false;
    }
  }

  // Generate test values based on field type
  private generateTestValue(type: string, fieldName: string, index: number): any {
    switch (type?.toLowerCase()) {
      case 'text':
      case 'string':
        if (fieldName.toLowerCase().includes('email')) {
          return `user${index}@example.com`;
        } else if (fieldName.toLowerCase().includes('name')) {
          return `Test Name ${index}`;
        }
        return `Test ${fieldName} ${index}`;
      
      case 'number':
      case 'integer':
        return Math.floor(Math.random() * 1000) + index;
      
      case 'decimal':
      case 'float':
        return parseFloat((Math.random() * 100 + index).toFixed(2));
      
      case 'boolean':
        return Math.random() > 0.5;
      
      case 'date':
        const date = new Date();
        date.setDate(date.getDate() - index);
        return date.toISOString().split('T')[0];
      
      case 'datetime':
      case 'timestamp':
        const datetime = new Date();
        datetime.setHours(datetime.getHours() - index);
        return datetime.toISOString();
      
      case 'url':
        return `https://example.com/item/${index}`;
      
      case 'image':
        return `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Image${index}`;
      
      default:
        return `Value ${index}`;
    }
  }
}

export const hybridDatabaseService = HybridDatabaseService.getInstance();