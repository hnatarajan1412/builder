import React, { useState } from 'react';
import { 
  Database, 
  Link2, 
  Table, 
  Hash, 
  Type, 
  Calendar, 
  ToggleLeft,
  X,
  Plus,
  ArrowRight,
  Zap,
  DollarSign,
  Percent,
  Clock
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentInstance } from '../types';

interface DataBindingPanelProps {
  component: ComponentInstance;
}

export const DataBindingPanel: React.FC<DataBindingPanelProps> = ({ component }) => {
  const { 
    tables, 
    currentApp, 
    updateComponentBinding,
    updateComponentBindings,
    updateComponentProps 
  } = useBuilderStore();
  
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [bindingMode, setBindingMode] = useState<'single' | 'list'>('single');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [formatType, setFormatType] = useState<string | null>(null);
  
  const appTables = currentApp 
    ? Object.values(tables).filter(table => table.appId === currentApp.id)
    : [];
  
  const currentBindings = component.bindings || {};
  const selectedTableData = selectedTable ? tables[selectedTable] : null;
  
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'string':
      case 'text':
        return <Type className="w-3 h-3" />;
      case 'number':
        return <Hash className="w-3 h-3" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3" />;
      case 'date':
      case 'datetime':
        return <Calendar className="w-3 h-3" />;
      default:
        return <Type className="w-3 h-3" />;
    }
  };
  
  const getBindableProperties = () => {
    switch (component.componentId) {
      case 'text':
        return ['text', 'fontSize', 'color'];
      case 'button':
        return ['label', 'disabled', 'backgroundColor'];
      case 'input':
        return ['value', 'placeholder', 'disabled', 'required'];
      case 'image':
        return ['src', 'alt'];
      case 'repeater':
        return ['dataSource', 'maxItems'];
      case 'table':
        return ['dataSource', 'columns'];
      case 'form':
        return ['initialValues', 'submitAction'];
      default:
        return ['value'];
    }
  };
  
  const handleBindProperty = (property: string, tableId: string, fieldName: string) => {
    // Show modal for formatting options
    setSelectedProperty(property);
    setSelectedField(fieldName);
    setShowModal(true);
  };
  
  const confirmBinding = () => {
    if (selectedProperty && selectedTable && selectedField) {
      const binding: any = {
        type: 'field',
        tableId: selectedTable,
        fieldName: selectedField,
        mode: bindingMode
      };
      
      // Add formatting if specified
      if (formatType) {
        binding.format = formatType;
        if (formatType === 'currency') {
          binding.currency = 'USD';
        } else if (formatType === 'number' || formatType === 'percentage') {
          binding.decimals = formatType === 'percentage' ? 0 : 2;
        }
      }
      
      updateComponentBinding(component.id, selectedProperty, binding);
      setShowModal(false);
      setSelectedProperty(null);
      setSelectedField(null);
      setFormatType(null);
    }
  };
  
  const handleUnbindProperty = (property: string) => {
    const newBindings = { ...currentBindings };
    delete newBindings[property];
    updateComponentBindings(component.id, newBindings);
  };
  
  const handleBindDataSource = () => {
    if (!selectedTable) return;
    
    if (component.componentId === 'repeater' || component.componentId === 'table') {
      updateComponentBinding(component.id, 'dataSource', {
        type: 'table',
        tableId: selectedTable,
        mode: 'list'
      });
    }
  };
  
  const isPropertyBound = (property: string) => {
    return !!currentBindings[property];
  };
  
  const getBoundFieldName = (property: string) => {
    const binding = currentBindings[property];
    if (binding && binding.fieldName) {
      return binding.fieldName;
    }
    return null;
  };
  
  const getFormatOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'number':
        return [
          { value: 'number', label: 'Number', icon: Hash },
          { value: 'currency', label: 'Currency', icon: DollarSign },
          { value: 'percentage', label: 'Percentage', icon: Percent }
        ];
      case 'date':
      case 'datetime':
        return [
          { value: 'date', label: 'Date', icon: Calendar },
          { value: 'datetime', label: 'Date & Time', icon: Clock }
        ];
      default:
        return [];
    }
  };

  const getFieldType = (fieldName: string) => {
    if (!selectedTable || !selectedTableData) return 'string';
    const field = selectedTableData.fields.find(f => f.name === fieldName);
    return field?.type || 'string';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Data Binding
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-indigo-600 hover:text-indigo-700"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>
      
      {/* Table Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Select Table
        </label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a table...</option>
          {appTables.map(table => (
            <option key={table.id} value={table.id}>
              {table.name} ({table.fields.length} fields)
            </option>
          ))}
        </select>
      </div>
      
      {/* Binding Mode */}
      {selectedTable && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Binding Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setBindingMode('single')}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                bindingMode === 'single'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Single Record
            </button>
            <button
              onClick={() => setBindingMode('list')}
              className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                bindingMode === 'list'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              List/Collection
            </button>
          </div>
        </div>
      )}
      
      {/* Data Source Binding (for repeaters/tables) */}
      {selectedTable && (component.componentId === 'repeater' || component.componentId === 'table') && (
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-indigo-900">Data Source</span>
            {currentBindings.dataSource ? (
              <button
                onClick={() => handleUnbindProperty('dataSource')}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Unbind
              </button>
            ) : (
              <button
                onClick={handleBindDataSource}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                Bind Table
              </button>
            )}
          </div>
          {currentBindings.dataSource && (
            <div className="text-xs text-indigo-700">
              Bound to: {tables[currentBindings.dataSource.tableId]?.name}
            </div>
          )}
        </div>
      )}
      
      {/* Property Bindings */}
      {selectedTable && selectedTableData && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">Bind Properties</h4>
          <div className="space-y-2">
            {getBindableProperties().map(property => (
              <div key={property} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {property}
                  </span>
                  {isPropertyBound(property) && (
                    <button
                      onClick={() => handleUnbindProperty(property)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {isPropertyBound(property) ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-600">
                    <Link2 className="w-3 h-3" />
                    <span>Bound to: {getBoundFieldName(property)}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    {selectedTableData.fields.map(field => (
                      <button
                        key={field.name}
                        onClick={() => handleBindProperty(property, selectedTable, field.name)}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                      >
                        {getFieldIcon(field.type)}
                        <span>{field.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Advanced Options */}
      {showAdvanced && selectedTable && (
        <div className="border-t pt-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Advanced Options</h4>
          
          {/* Filters */}
          <div className="mb-3">
            <label className="text-xs text-gray-600">Filters</label>
            <button className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              Add Filter
            </button>
          </div>
          
          {/* Sorting */}
          <div className="mb-3">
            <label className="text-xs text-gray-600">Sort By</label>
            <select className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg">
              <option>Default</option>
              {selectedTableData?.fields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.name} (A-Z)
                </option>
              ))}
            </select>
          </div>
          
          {/* Limit */}
          {bindingMode === 'list' && (
            <div>
              <label className="text-xs text-gray-600">Limit Records</label>
              <input
                type="number"
                placeholder="No limit"
                className="w-full mt-1 px-3 py-2 text-xs border border-gray-200 rounded-lg"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="space-y-1">
          <button className="w-full px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
            <Zap className="w-3 h-3 text-yellow-600" />
            <span>Auto-bind matching fields</span>
          </button>
          <button className="w-full px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
            <ArrowRight className="w-3 h-3 text-green-600" />
            <span>Create form from table</span>
          </button>
        </div>
      </div>
      
      {/* Formatting Modal */}
      {showModal && selectedProperty && selectedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Configure Binding</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Binding <span className="font-medium">{selectedProperty}</span> to{' '}
                  <span className="font-medium">{selectedField}</span>
                </p>
              </div>
              
              {/* Format Options */}
              {getFormatOptions(getFieldType(selectedField)).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format As (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getFormatOptions(getFieldType(selectedField)).map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFormatType(
                          formatType === option.value ? null : option.value
                        )}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                          formatType === option.value
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Format-specific options */}
              {formatType === 'currency' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              )}
              
              {(formatType === 'number' || formatType === 'percentage') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimal Places
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    defaultValue={formatType === 'percentage' ? 0 : 2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProperty(null);
                  setSelectedField(null);
                  setFormatType(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmBinding}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Binding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};