import React from 'react';
import { useBuilderStore } from '../stores/builder.store';
import { Database, Settings, Send, RotateCcw } from 'lucide-react';

interface FormPropertiesPanelProps {
  componentId: string;
}

export const FormPropertiesPanel: React.FC<FormPropertiesPanelProps> = ({ componentId }) => {
  const { currentApp, tables, updateComponentProps, selectedComponent } = useBuilderStore();
  
  if (!selectedComponent || selectedComponent.componentId !== 'form') {
    return null;
  }

  const appTables = Object.values(tables).filter(table => table.appId === currentApp?.id);
  const props = selectedComponent.props || {};

  const handleSubmitActionChange = (action: string) => {
    updateComponentProps(componentId, { submitAction: action });
  };

  const handleTargetTableChange = (tableId: string) => {
    const table = appTables.find(t => t.id === tableId);
    updateComponentProps(componentId, { 
      targetTable: table?.name || null,
      targetTableId: tableId 
    });
  };

  const handleSubmitButtonTextChange = (text: string) => {
    updateComponentProps(componentId, { submitButtonText: text });
  };

  const handleApiUrlChange = (url: string) => {
    updateComponentProps(componentId, { apiUrl: url });
  };

  const handleResetAfterSubmitChange = (reset: boolean) => {
    updateComponentProps(componentId, { resetAfterSubmit: reset });
  };

  const handleShowResetButtonChange = (show: boolean) => {
    updateComponentProps(componentId, { showResetButton: show });
  };

  return (
    <div className="space-y-6">
      {/* Submit Action */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Action
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={props.submitAction || 'database'}
              onChange={(e) => handleSubmitActionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="database">Save to Database</option>
              <option value="api">Send to API</option>
              <option value="console">Log to Console</option>
            </select>
          </div>

          {/* Database Configuration */}
          {props.submitAction === 'database' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Table
              </label>
              {appTables.length === 0 ? (
                <div className="text-center py-3 border border-dashed border-gray-300 rounded-lg">
                  <Database className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm text-gray-600">No tables available</p>
                  <p className="text-xs text-gray-500">Create a table in the Data panel first</p>
                </div>
              ) : (
                <select
                  value={props.targetTableId || ''}
                  onChange={(e) => handleTargetTableChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a table...</option>
                  {appTables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.fields.length} fields)
                    </option>
                  ))}
                </select>
              )}
              
              {props.targetTable && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  Form data will be saved to: <strong>{props.targetTable}</strong>
                </div>
              )}
            </div>
          )}

          {/* API Configuration */}
          {props.submitAction === 'api' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint URL
              </label>
              <input
                type="url"
                value={props.apiUrl || ''}
                onChange={(e) => handleApiUrlChange(e.target.value)}
                placeholder="https://api.example.com/submit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Form data will be sent as JSON POST request
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Button Configuration */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Button Settings
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submit Button Text
            </label>
            <input
              type="text"
              value={props.submitButtonText || 'Submit'}
              onChange={(e) => handleSubmitButtonTextChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showResetButton"
              checked={props.showResetButton || false}
              onChange={(e) => handleShowResetButtonChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showResetButton" className="ml-2 block text-sm text-gray-900">
              Show Reset Button
            </label>
          </div>
        </div>
      </div>

      {/* Form Behavior */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Form Behavior
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="resetAfterSubmit"
              checked={props.resetAfterSubmit !== false}
              onChange={(e) => handleResetAfterSubmitChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="resetAfterSubmit" className="ml-2 block text-sm text-gray-900">
              Clear form after successful submission
            </label>
          </div>
        </div>
      </div>

      {/* Form Fields Info */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Form Fields
        </h4>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Add input components inside this form to create form fields.
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-700 font-medium mb-1">Supported field types:</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li>• Text inputs (name, email, etc.)</li>
              <li>• Textareas (descriptions, comments)</li>
              <li>• Select dropdowns (categories, options)</li>
              <li>• Checkboxes and radio buttons</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Info */}
      {props.targetTable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-yellow-800 mb-1">
            Field Validation
          </h5>
          <p className="text-xs text-yellow-700">
            Make sure your form fields match the table schema. Required fields in the table must have corresponding form inputs.
          </p>
        </div>
      )}
    </div>
  );
};