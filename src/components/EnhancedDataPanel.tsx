import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, X, Table2, Search, Filter, Download, Upload, Eye, Settings } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { databaseService } from '../services/database-compat.service';
import { EditTableSchema } from './EditTableSchema';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

export const EnhancedDataPanel: React.FC = () => {
  const { currentApp, tables, createTable, updateTable, deleteTable, setSelectedTable, setSidePanelMode } = useBuilderStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tables');
  const [searchTerm, setSearchTerm] = useState('');

  // New table form state
  const [newTableName, setNewTableName] = useState('');
  const [newTableFields, setNewTableFields] = useState([
    { name: 'id', type: 'uuid', primaryKey: true, required: true, readOnly: true }
  ]);

  const fieldTypes = ['string', 'number', 'boolean', 'date', 'datetime', 'text', 'json', 'uuid', 'geolocation', 'relationship'];

  if (!currentApp) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center empty-state">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No app selected</h3>
          <p className="text-sm text-gray-500">Select an app to manage its database</p>
        </div>
      </div>
    );
  }

  const appTables = Object.values(tables).filter(table => table.appId === currentApp.id);
  const filteredTables = appTables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTable = async () => {
    if (!newTableName || newTableFields.length === 0) return;
    
    await createTable({
      appId: currentApp.id,
      name: newTableName,
      fields: newTableFields.map(field => ({
        ...field,
        type: field.type as any
      }))
    });
    
    setIsCreating(false);
    setNewTableName('');
    setNewTableFields([{ name: 'id', type: 'uuid', primaryKey: true, required: true, readOnly: true }]);
  };

  const addField = () => {
    setNewTableFields([...newTableFields, { name: '', type: 'string', primaryKey: false, required: false }]);
  };

  const updateField = (index: number, updates: any) => {
    // Don't allow updating the id field
    if (index === 0 && newTableFields[0].name === 'id') {
      return;
    }
    const updated = [...newTableFields];
    updated[index] = { ...updated[index], ...updates };
    setNewTableFields(updated);
  };

  const removeField = (index: number) => {
    // Don't allow removing the id field
    if (index === 0 && newTableFields[0].name === 'id') {
      return;
    }
    if (newTableFields.length > 1) {
      setNewTableFields(newTableFields.filter((_, i) => i !== index));
    }
  };

  const getTableStats = (table: any) => {
    const data = databaseService.getData(currentApp.id, table.name);
    return {
      recordCount: data.length,
      lastModified: 'Recently',
      size: `${JSON.stringify(data).length} bytes`
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              Database
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 ml-10">Manage tables and data for {currentApp.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <Tabs.List className="flex border-b px-4 bg-gray-50">
          <Tabs.Trigger 
            value="tables" 
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white"
          >
            <Table2 className="w-4 h-4 mr-1" />
            Tables ({appTables.length})
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="settings" 
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-white"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tables Tab */}
        <Tabs.Content value="tables" className="flex-1 overflow-y-auto p-3 bg-gray-50">
          {filteredTables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h4>
              <p className="text-gray-500 mb-6">Create your first table to start storing data</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Table
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTables.map((table) => {
                const stats = getTableStats(table);
                return (
                  <div
                    key={table.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                          <Table2 className="w-4 h-4 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-base font-semibold text-gray-900">{table.name}</h4>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {stats.recordCount} records
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {table.fields.length} fields • Last modified {stats.lastModified}
                          </p>
                          
                          {/* Field Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {table.fields.slice(0, 6).map((field) => (
                              <div key={field.name} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs">
                                <span className="font-medium text-gray-700">{field.name}</span>
                                <span className="text-gray-500">({field.type})</span>
                                {field.primaryKey && <span className="text-blue-600 font-medium">PK</span>}
                              </div>
                            ))}
                            {table.fields.length > 6 && (
                              <span className="text-xs text-gray-500 px-2 py-1">+{table.fields.length - 6} more</span>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-3 text-sm">
                            <button 
                              onClick={() => {
                                setSelectedTable(table.id);
                                setSidePanelMode('table-data');
                              }}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Data
                            </button>
                            <span className="text-gray-300">•</span>
                            <button 
                              onClick={() => setEditingId(table.id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Edit Schema
                            </button>
                            <span className="text-gray-300">•</span>
                            <button className="text-gray-600 hover:text-gray-800">
                              Export
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedTable(table.id);
                            setSidePanelMode('table-data');
                          }}
                          className="p-2 hover:bg-gray-100 rounded-md"
                          title="View data"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setEditingId(table.id)}
                          className="p-2 hover:bg-gray-100 rounded-md"
                          title="Edit schema"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete table "${table.name}"? This will also delete all data.`)) {
                              deleteTable(table.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-md"
                          title="Delete table"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Tabs.Content>
        
        {/* Settings Tab */}
        <Tabs.Content value="settings" className="flex-1 p-4 bg-gray-50">
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Database Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={currentApp.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-backup
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Enable automatic backups
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Import/Export
                </label>
                <div className="flex gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                    <Upload className="w-4 h-4 inline mr-1" />
                    Import CSV
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                    <Download className="w-4 h-4 inline mr-1" />
                    Export All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Enhanced Table Creation Dialog */}
      <Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-lg font-semibold">
                Create New Table
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Name
                  </label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name (e.g., users, products)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Fields</label>
                    <button
                      onClick={addField}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                    >
                      <Plus className="w-3 h-3" />
                      Add Field
                    </button>
                  </div>
                  
                  <div className="space-y-3 border border-gray-200 rounded-lg p-3">
                    {newTableFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="Field name"
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded"
                          disabled={index === 0 && field.name === 'id'}
                        />
                        
                        <select
                          value={field.type}
                          onChange={(e) => {
                            updateField(index, { type: e.target.value });
                            // Clear relationship data if changing from relationship type
                            if (field.type === 'relationship' && e.target.value !== 'relationship') {
                              updateField(index, { relationshipType: undefined, relatedTable: undefined });
                            }
                          }}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded"
                          disabled={index === 0 && field.name === 'id'}
                        >
                          {fieldTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        
                        <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.primaryKey || false}
                            onChange={(e) => updateField(index, { primaryKey: e.target.checked })}
                            className="w-4 h-4"
                            disabled={index === 0 && field.name === 'id'}
                          />
                          PK
                        </label>
                        
                        <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="w-4 h-4"
                            disabled={index === 0 && field.name === 'id'}
                          />
                          Required
                        </label>
                        
                        {/* Relationship Configuration */}
                        {field.type === 'relationship' && (
                          <>
                            <select
                              value={field.relatedTable || ''}
                              onChange={(e) => updateField(index, { relatedTable: e.target.value })}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded"
                            >
                              <option value="">Select table...</option>
                              {Object.values(tables).map(table => (
                                <option key={table.id} value={table.name}>{table.name}</option>
                              ))}
                            </select>
                            
                            <select
                              value={field.relationshipType || ''}
                              onChange={(e) => updateField(index, { relationshipType: e.target.value })}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded"
                            >
                              <option value="">Type...</option>
                              <option value="oneToMany">One to Many</option>
                              <option value="manyToOne">Many to One</option>
                              <option value="manyToMany">Many to Many</option>
                            </select>
                          </>
                        )}
                        
                        {newTableFields.length > 1 && !(index === 0 && field.name === 'id') && (
                          <button
                            onClick={() => removeField(index)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                disabled={!newTableName || newTableFields.some(f => !f.name)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Table
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Table Schema Dialog */}
      <Dialog.Root open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
            {editingId && tables[editingId] && (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-lg font-semibold">
                    Edit Table Schema: {tables[editingId].name}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <EditTableSchema 
                  table={tables[editingId]}
                  fieldTypes={fieldTypes}
                  allTables={tables}
                  onSave={(fields) => {
                    updateTable(editingId, { fields });
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};