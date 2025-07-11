import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Type, Hash, Calendar, ToggleLeft, Image, Link, Key, MapPin } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { MagicTextProcessor } from '../utils/magicTextProcessor';
import { hybridDatabaseService } from '../services/hybrid-database.service';

interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'url' | 'uuid' | 'geolocation';
  format?: string;
  width?: number;
}

interface TableColumnManagerProps {
  dataSource: string; // e.g., "{{products}}"
  columns: TableColumn[];
  onChange: (columns: TableColumn[]) => void;
}

interface AvailableField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'url' | 'uuid' | 'geolocation';
  label: string;
}

export const TableColumnManager: React.FC<TableColumnManagerProps> = ({
  dataSource,
  columns,
  onChange
}) => {
  const { tables } = useBuilderStore();
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [availableFields, setAvailableFields] = useState<AvailableField[]>([]);

  // Extract table name from magic text (e.g., "{{products}}" -> "products")
  const getTableName = (magicText: string): string => {
    const match = magicText.match(/^\{\{([^}]+)\}\}$/);
    return match ? match[1].trim() : '';
  };

  // Helper function for default formats
  const getDefaultFormat = (type: string): string => {
    switch (type) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      case 'uuid':
        return 'uuid';
      case 'geolocation':
        return 'geolocation';
      default:
        return 'text';
    }
  };

  // Get available fields from the bound data source
  useEffect(() => {
    if (!dataSource) {
      setAvailableFields([]);
      return;
    }

    const tableName = getTableName(dataSource);
    if (!tableName) {
      setAvailableFields([]);
      return;
    }

    // Find table by name instead of ID
    const table = Object.values(tables).find(t => t.name === tableName);
    if (!table) {
      setAvailableFields([]);
      return;
    }

    const fields: AvailableField[] = [];

    // Get fields from table schema
    if (table.fields) {
      Object.entries(table.fields).forEach(([fieldName, fieldDef]: [string, any]) => {
        let type: AvailableField['type'] = 'text';
        
        // Map database types to display types
        switch (fieldDef.type) {
          case 'number':
          case 'integer':
          case 'decimal':
            type = 'number';
            break;
          case 'date':
          case 'datetime':
          case 'timestamp':
            type = 'date';
            break;
          case 'boolean':
            type = 'boolean';
            break;
          case 'url':
            type = 'url';
            break;
          case 'image':
            type = 'image';
            break;
          case 'uuid':
            type = 'uuid';
            break;
          default:
            type = 'text';
        }

        fields.push({
          name: fieldName,
          type,
          label: fieldDef.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        });
      });
    }

    // If no schema, try to get data from hybrid database service
    if (fields.length === 0) {
      const { currentApp } = useBuilderStore.getState();
      if (currentApp) {
        // Use async field detection from actual data
        hybridDatabaseService.getTableFieldsFromData(currentApp.id, tableName)
          .then(dataFields => {
            if (dataFields.length > 0) {
              const mappedFields: AvailableField[] = dataFields.map(field => ({
                name: field.name,
                type: field.type as AvailableField['type'],
                label: field.label
              }));
              setAvailableFields(mappedFields);
            }
          })
          .catch(error => {
            console.error('Error loading table data:', error);
          });
      }
    }

    setAvailableFields(fields);

    // Auto-map all columns when data source is first set and no columns exist
    if (fields.length > 0 && columns.length === 0 && dataSource) {
      const autoColumns: TableColumn[] = fields.map(field => ({
        field: field.name,
        label: field.label,
        type: field.type,
        format: getDefaultFormat(field.type)
      }));
      
      // Auto-add all detected fields as columns
      onChange(autoColumns);
    }
  }, [dataSource, tables, columns.length, onChange]);

  const addColumn = (field: AvailableField) => {
    // Check if column already exists
    if (columns.find(col => col.field === field.name)) {
      return;
    }

    const newColumn: TableColumn = {
      field: field.name,
      label: field.label,
      type: field.type,
      format: getDefaultFormat(field.type)
    };

    onChange([...columns, newColumn]);
    setShowAddColumn(false);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    onChange(newColumns);
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = columns.map((col, i) => 
      i === index ? { ...col, ...updates } : col
    );
    onChange(newColumns);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'boolean':
        return <ToggleLeft className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'url':
        return <Link className="w-4 h-4" />;
      case 'uuid':
        return <Key className="w-4 h-4" />;
      case 'geolocation':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const getFormatOptions = (type: string) => {
    switch (type) {
      case 'number':
        return [
          { value: 'number', label: 'Number' },
          { value: 'currency', label: 'Currency' },
          { value: 'percentage', label: 'Percentage' }
        ];
      case 'date':
        return [
          { value: 'date', label: 'Date (MM/DD/YYYY)' },
          { value: 'datetime', label: 'Date & Time' },
          { value: 'relative', label: 'Relative (2 days ago)' }
        ];
      case 'boolean':
        return [
          { value: 'checkbox', label: 'Checkbox' },
          { value: 'text', label: 'True/False Text' },
          { value: 'icon', label: 'Check/X Icons' }
        ];
      case 'uuid':
        return [
          { value: 'uuid', label: 'UUID' },
          { value: 'short', label: 'Short UUID (8 chars)' },
          { value: 'text', label: 'Text' }
        ];
      case 'geolocation':
        return [
          { value: 'geolocation', label: 'Coordinates' },
          { value: 'address', label: 'Address' },
          { value: 'map', label: 'Map View' }
        ];
      default:
        return [{ value: 'text', label: 'Text' }];
    }
  };

  if (!dataSource) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">Select a data source to configure columns</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Column List */}
      <div className="space-y-2">
        {columns.map((column, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            {getTypeIcon(column.type || 'text')}
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => updateColumn(index, { label: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Column Label"
                />
                <select
                  value={column.format || ''}
                  onChange={(e) => updateColumn(index, { format: e.target.value })}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  {getFormatOptions(column.type || 'text').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-gray-500">
                Field: {column.field} • Type: {column.type}
              </div>
            </div>

            <button
              onClick={() => removeColumn(index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Column Button */}
      {availableFields.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowAddColumn(!showAddColumn)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-lg w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            ADD COLUMN
          </button>

          {/* Available Fields Dropdown */}
          {showAddColumn && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Available Fields from {getTableName(dataSource)}
                </p>
              </div>
              {availableFields.map(field => {
                const isAlreadyAdded = columns.find(col => col.field === field.name);
                return (
                  <button
                    key={field.name}
                    onClick={() => addColumn(field)}
                    disabled={!!isAlreadyAdded}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 ${
                      isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {getTypeIcon(field.type)}
                    <div>
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-xs text-gray-500">{field.name} • {field.type}</div>
                    </div>
                    {isAlreadyAdded && (
                      <div className="text-xs text-green-600 ml-auto">Added</div>
                    )}
                  </button>
                );
              })}
              {availableFields.length === 0 && (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No fields found in {getTableName(dataSource)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {columns.length === 0 && availableFields.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Click "ADD COLUMN" to select fields to display</p>
        </div>
      )}

      {availableFields.length === 0 && dataSource && (
        <div className="text-center py-4 text-yellow-600 bg-yellow-50 rounded-lg">
          <p className="text-sm">
            No fields detected from "{getTableName(dataSource)}" table.
            Make sure the table exists and has data.
          </p>
        </div>
      )}
    </div>
  );
};