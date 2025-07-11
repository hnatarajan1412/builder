// PostgreSQL service for data table storage
// This handles actual table data while schemas remain in localStorage

interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

interface DatabaseRecord {
  [key: string]: any;
}

interface QueryResult {
  rows: any[];
  columns: string[];
}

export class PostgresService {
  private static instance: PostgresService;
  private config: PostgresConfig;
  private isConnected: boolean = false;

  private constructor() {
    // Default config - browser compatible
    this.config = {
      host: 'localhost',
      port: 5432,
      database: 'nocode_builder',
      username: 'postgres',
      password: 'password'
    };
  }

  static getInstance(): PostgresService {
    if (!PostgresService.instance) {
      PostgresService.instance = new PostgresService();
    }
    return PostgresService.instance;
  }

  // Initialize connection and create database if needed
  async initialize(): Promise<boolean> {
    try {
      // For now, we'll simulate PostgreSQL connection
      // In a real implementation, you'd use a library like 'pg' or 'postgres'
      console.log('Initializing PostgreSQL connection...');
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Create table in PostgreSQL based on schema
  async createTable(appId: string, tableName: string, schema: Record<string, any>): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Generate CREATE TABLE SQL from schema
      const tableNameWithApp = `${appId}_${tableName}`;
      let sql = `CREATE TABLE IF NOT EXISTS "${tableNameWithApp}" (\n`;
      sql += `  id SERIAL PRIMARY KEY,\n`;
      sql += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
      sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;

      // Add fields from schema
      if (schema) {
        Object.entries(schema).forEach(([fieldName, fieldDef]: [string, any]) => {
          sql += `,\n  "${fieldName}" ${this.mapTypeToPostgres(fieldDef.type)}`;
        });
      }

      sql += '\n);';

      // For now, we'll simulate the SQL execution
      console.log('Would execute SQL:', sql);
      
      // In real implementation:
      // await this.pool.query(sql);
      
      return true;
    } catch (error) {
      console.error('Error creating table:', error);
      return false;
    }
  }

  // Insert record into PostgreSQL table
  async insert(appId: string, tableName: string, data: DatabaseRecord): Promise<DatabaseRecord | null> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      
      // Generate INSERT SQL
      const fields = Object.keys(data).filter(key => key !== 'id');
      const values = fields.map(field => data[field]);
      const placeholders = fields.map((_, index) => `$${index + 1}`);

      const sql = `
        INSERT INTO "${tableNameWithApp}" (${fields.map(f => `"${f}"`).join(', ')}) 
        VALUES (${placeholders.join(', ')}) 
        RETURNING *;
      `;

      console.log('Would execute INSERT:', sql, values);

      // Simulate returning inserted record with ID
      const insertedRecord = {
        id: Date.now(),
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Store in localStorage as fallback for now
      this.fallbackToLocalStorage('insert', appId, tableName, insertedRecord);

      return insertedRecord;
    } catch (error) {
      console.error('Error inserting record:', error);
      return null;
    }
  }

  // Query records from PostgreSQL table
  async query(appId: string, tableName: string, conditions?: any): Promise<QueryResult> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      
      let sql = `SELECT * FROM "${tableNameWithApp}"`;
      const values: any[] = [];

      // Add WHERE conditions if provided
      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions).map((key, index) => {
          values.push(conditions[key]);
          return `"${key}" = $${index + 1}`;
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
      }

      sql += ' ORDER BY created_at DESC;';

      console.log('Would execute SELECT:', sql, values);

      // For now, fallback to localStorage
      const rows = this.fallbackToLocalStorage('query', appId, tableName) || [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return { rows, columns };
    } catch (error) {
      console.error('Error querying records:', error);
      return { rows: [], columns: [] };
    }
  }

  // Update record in PostgreSQL table
  async update(appId: string, tableName: string, id: any, updates: DatabaseRecord): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      
      const fields = Object.keys(updates);
      const values = fields.map(field => updates[field]);
      const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');

      const sql = `
        UPDATE "${tableNameWithApp}" 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${fields.length + 1};
      `;

      values.push(id);

      console.log('Would execute UPDATE:', sql, values);

      // Fallback to localStorage
      this.fallbackToLocalStorage('update', appId, tableName, { id, ...updates });

      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      return false;
    }
  }

  // Delete record from PostgreSQL table
  async delete(appId: string, tableName: string, id: any): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      const sql = `DELETE FROM "${tableNameWithApp}" WHERE id = $1;`;

      console.log('Would execute DELETE:', sql, [id]);

      // Fallback to localStorage
      this.fallbackToLocalStorage('delete', appId, tableName, { id });

      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }

  // Map schema field types to PostgreSQL types
  private mapTypeToPostgres(type: string): string {
    switch (type?.toLowerCase()) {
      case 'text':
      case 'string':
        return 'TEXT';
      case 'number':
      case 'integer':
        return 'INTEGER';
      case 'decimal':
      case 'float':
        return 'DECIMAL';
      case 'boolean':
        return 'BOOLEAN';
      case 'date':
        return 'DATE';
      case 'datetime':
      case 'timestamp':
        return 'TIMESTAMP';
      case 'json':
        return 'JSONB';
      case 'url':
      case 'image':
        return 'TEXT';
      default:
        return 'TEXT';
    }
  }

  // Fallback to localStorage until PostgreSQL is properly set up
  private fallbackToLocalStorage(operation: string, appId: string, tableName: string, data?: any): any {
    const storageKey = `postgres_fallback_${appId}_${tableName}`;
    
    try {
      switch (operation) {
        case 'insert':
          const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
          existingData.push(data);
          localStorage.setItem(storageKey, JSON.stringify(existingData));
          return data;

        case 'query':
          return JSON.parse(localStorage.getItem(storageKey) || '[]');

        case 'update':
          const updateData = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const updateIndex = updateData.findIndex((item: any) => item.id === data.id);
          if (updateIndex !== -1) {
            updateData[updateIndex] = { ...updateData[updateIndex], ...data, updated_at: new Date() };
            localStorage.setItem(storageKey, JSON.stringify(updateData));
          }
          return true;

        case 'delete':
          const deleteData = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const filteredData = deleteData.filter((item: any) => item.id !== data.id);
          localStorage.setItem(storageKey, JSON.stringify(filteredData));
          return true;

        default:
          return null;
      }
    } catch (error) {
      console.error('Fallback localStorage operation failed:', error);
      return null;
    }
  }

  // Get all data from a table (used for field detection)
  async getAllData(appId: string, tableName: string): Promise<DatabaseRecord[]> {
    const result = await this.query(appId, tableName);
    return result.rows;
  }

  // Update table schema - handles ALTER TABLE operations
  async updateTableSchema(appId: string, tableName: string, newSchema: Record<string, any>, relationships: any[]): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      
      // For now, we'll simulate schema updates
      // In a real implementation, you would:
      // 1. Compare old schema with new schema
      // 2. Generate ALTER TABLE statements for added/removed/modified columns
      // 3. Handle foreign key constraints for relationships
      
      console.log(`Would update table schema for "${tableNameWithApp}"`);
      console.log('New fields:', newSchema);
      console.log('Relationships:', relationships);
      
      // Example ALTER TABLE operations that would be executed:
      // - Add column: ALTER TABLE table_name ADD COLUMN column_name data_type;
      // - Drop column: ALTER TABLE table_name DROP COLUMN column_name;
      // - Modify column: ALTER TABLE table_name ALTER COLUMN column_name TYPE data_type;
      // - Add foreign key: ALTER TABLE table_name ADD CONSTRAINT fk_name FOREIGN KEY (column) REFERENCES other_table(id);
      
      return true;
    } catch (error) {
      console.error('Error updating table schema:', error);
      return false;
    }
  }

  // Drop table completely
  async dropTable(appId: string, tableName: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      const sql = `DROP TABLE IF EXISTS "${tableNameWithApp}" CASCADE;`;
      
      // For now, we'll simulate the SQL execution
      console.log('Would execute SQL:', sql);
      
      // Also clear localStorage fallback
      const storageKey = `postgres_fallback_${appId}_${tableName}`;
      localStorage.removeItem(storageKey);
      
      return true;
    } catch (error) {
      console.error('Error dropping table:', error);
      return false;
    }
  }

  // Clear all data from a table
  async clearTable(appId: string, tableName: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const tableNameWithApp = `${appId}_${tableName}`;
      const sql = `DELETE FROM "${tableNameWithApp}";`;

      console.log('Would execute CLEAR:', sql);

      // Fallback to localStorage
      const storageKey = `postgres_fallback_${appId}_${tableName}`;
      localStorage.removeItem(storageKey);

      return true;
    } catch (error) {
      console.error('Error clearing table:', error);
      return false;
    }
  }
}

export const postgresService = PostgresService.getInstance();