// Database Compatibility Service
// This service provides a seamless migration path from the old database service
// to the new hybrid database service. It wraps the hybrid service with the
// exact same API as the old service, handling async-to-sync conversions.

import { hybridDatabaseService } from './hybrid-database.service';
import { Table } from '../types';

interface QueryResult {
  rows: any[];
  columns: string[];
}

interface DatabaseRecord {
  [key: string]: any;
}

export class DatabaseCompatService {
  private static instance: DatabaseCompatService;
  
  private constructor() {}
  
  static getInstance(): DatabaseCompatService {
    if (!DatabaseCompatService.instance) {
      DatabaseCompatService.instance = new DatabaseCompatService();
    }
    return DatabaseCompatService.instance;
  }

  // Initialize app
  initializeApp(appId: string): void {
    hybridDatabaseService.initializeApp(appId);
  }

  // Create table - synchronous wrapper
  createTable(appId: string, table: Table): void {
    hybridDatabaseService.createTableSync(appId, table);
  }

  // Insert data - synchronous wrapper
  insert(appId: string, tableName: string, data: DatabaseRecord): DatabaseRecord {
    return hybridDatabaseService.insertSync(appId, tableName, data);
  }

  // Query data - already synchronous
  query(appId: string, tableName: string, conditions?: any): QueryResult {
    return hybridDatabaseService.query(appId, tableName, conditions);
  }

  // Update data - synchronous wrapper
  update(appId: string, tableName: string, id: any, updates: DatabaseRecord): boolean {
    return hybridDatabaseService.updateSync(appId, tableName, id, updates);
  }

  // Delete data - synchronous wrapper
  delete(appId: string, tableName: string, id: any): boolean {
    return hybridDatabaseService.deleteSync(appId, tableName, id);
  }

  // Clear table - async to sync wrapper
  clearTable(appId: string, tableName: string): void {
    const storageKey = `postgres_fallback_${appId}_${tableName}`;
    localStorage.setItem(storageKey, JSON.stringify([]));
    
    // Queue async clear
    hybridDatabaseService.clearTable(appId, tableName).catch(err =>
      console.error('Async clearTable failed:', err)
    );
  }

  // Get all data - synchronous
  getAllData(appId: string, tableName: string): DatabaseRecord[] {
    return hybridDatabaseService.getAllDataSync(appId, tableName);
  }

  // Drop table - async to sync wrapper
  dropTable(appId: string, tableName: string): void {
    // Remove from schemas
    const schemas = JSON.parse(localStorage.getItem('nocode_table_schemas') || '{}');
    if (schemas[appId] && schemas[appId][tableName]) {
      delete schemas[appId][tableName];
      localStorage.setItem('nocode_table_schemas', JSON.stringify(schemas));
    }
    
    // Clear data
    this.clearTable(appId, tableName);
    
    // Queue async drop
    hybridDatabaseService.dropTable(appId, tableName).catch(err =>
      console.error('Async dropTable failed:', err)
    );
  }

  // Alias methods
  getData(appId: string, tableName: string): DatabaseRecord[] {
    return this.getAllData(appId, tableName);
  }

  insertData(appId: string, tableName: string, data: DatabaseRecord): DatabaseRecord {
    return this.insert(appId, tableName, data);
  }

  updateData(appId: string, tableName: string, id: any, updates: DatabaseRecord): boolean {
    return this.update(appId, tableName, id, updates);
  }

  deleteData(appId: string, tableName: string, id: any): boolean {
    return this.delete(appId, tableName, id);
  }

  // Seed test data - async to sync wrapper
  seedTestData(appId: string, table: Table, rowCount: number = 5): void {
    this.createTable(appId, table);
    
    for (let i = 0; i < rowCount; i++) {
      const record: DatabaseRecord = {};
      
      table.fields.forEach(field => {
        switch (field.type) {
          case 'string':
          case 'text':
            if (field.name.toLowerCase().includes('email')) {
              record[field.name] = `user${i + 1}@example.com`;
            } else if (field.name.toLowerCase().includes('name')) {
              record[field.name] = `Test User ${i + 1}`;
            } else if (field.name.toLowerCase().includes('title')) {
              record[field.name] = `Title ${i + 1}`;
            } else {
              record[field.name] = `${field.name} value ${i + 1}`;
            }
            break;
          case 'number':
            if (field.name.toLowerCase().includes('price')) {
              record[field.name] = parseFloat((Math.random() * 100).toFixed(2));
            } else if (field.name.toLowerCase().includes('age')) {
              record[field.name] = 20 + Math.floor(Math.random() * 40);
            } else {
              record[field.name] = i + 1;
            }
            break;
          case 'boolean':
            record[field.name] = i % 2 === 0;
            break;
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() - i);
            record[field.name] = date.toISOString().split('T')[0];
            break;
          case 'datetime':
            const datetime = new Date();
            datetime.setDate(datetime.getDate() - i);
            record[field.name] = datetime.toISOString();
            break;
          case 'json':
            record[field.name] = { 
              key: `value${i + 1}`,
              index: i 
            };
            break;
          default:
            record[field.name] = `${field.name} ${i + 1}`;
        }
      });
      
      this.insert(appId, table.name, record);
    }
    
    // Also queue the async version for proper PostgreSQL seeding
    hybridDatabaseService.seedTestData(appId, table, rowCount).catch(err =>
      console.error('Async seedTestData failed:', err)
    );
  }
}

// Export a singleton instance that matches the old service export
export const databaseService = DatabaseCompatService.getInstance();