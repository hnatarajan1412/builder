import React, { useState } from 'react';
import { useBuilderStore } from '../stores/builder.store';
import { Database, Table2, Repeat, Settings } from 'lucide-react';

interface RepeaterPropertiesPanelProps {
  componentId: string;
}

export const RepeaterPropertiesPanel: React.FC<RepeaterPropertiesPanelProps> = ({ componentId }) => {
  const { currentApp, tables, updateComponentProps, selectedComponent } = useBuilderStore();
  const [selectedDataSource, setSelectedDataSource] = useState('');
  
  if (!selectedComponent || selectedComponent.componentId !== 'repeater') {
    return null;
  }

  const appTables = Object.values(tables).filter(table => table.appId === currentApp?.id);
  const currentDataSource = selectedComponent.props?.dataSource;

  const handleDataSourceChange = (tableId: string) => {
    const table = appTables.find(t => t.id === tableId);
    if (table) {
      updateComponentProps(componentId, {
        dataSource: {
          type: 'table',
          appId: currentApp?.id,
          tableName: table.name,
          tableId: table.id
        }
      });
    }
  };

  const handleMaxItemsChange = (maxItems: number) => {
    updateComponentProps(componentId, { maxItems });
  };

  const handleSpacingChange = (spacing: number) => {
    updateComponentProps(componentId, { spacing });
  };

  return (
    <div className="space-y-6">
      {/* Data Source Configuration */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Source
        </h4>
        
        {appTables.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
            <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">No tables available</p>
            <p className="text-xs text-gray-500">Create a table in the Data panel first</p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Table
            </label>
            <select 
              value={currentDataSource?.tableId || ''}
              onChange={(e) => handleDataSourceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a table...</option>
              {appTables.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.fields.length} fields)
                </option>
              ))}
            </select>
            
            {currentDataSource && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Connected to: {currentDataSource.tableName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Available fields: {appTables.find(t => t.id === currentDataSource.tableId)?.fields.map(f => f.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display Settings */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Display Settings
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Items
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={selectedComponent.props?.maxItems || 100}
              onChange={(e) => handleMaxItemsChange(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Limit the number of items displayed
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Spacing
            </label>
            <select
              value={selectedComponent.props?.spacing || 2}
              onChange={(e) => handleSpacingChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>No spacing</option>
              <option value={1}>Small (0.25rem)</option>
              <option value={2}>Medium (0.5rem)</option>
              <option value={3}>Large (0.75rem)</option>
              <option value={4}>Extra Large (1rem)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Template Configuration */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Repeat className="w-4 h-4" />
          Template
        </h4>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            Drop components into the repeater to create the template for each item.
          </p>
          <p className="text-xs text-gray-500">
            Use template expressions like <code className="bg-gray-200 px-1 rounded">{'{{item.name}}'}</code> to display data from each record.
          </p>
        </div>

        {selectedComponent.children && selectedComponent.children.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Template configured
            </p>
            <p className="text-xs text-green-600 mt-1">
              {selectedComponent.children.length} component(s) in template
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {currentDataSource && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Data Preview
          </h4>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>Table: {currentDataSource.tableName}</p>
            <p>Records: Loading...</p>
            <p>Template: {selectedComponent.children?.length || 0} component(s)</p>
          </div>
        </div>
      )}
    </div>
  );
};