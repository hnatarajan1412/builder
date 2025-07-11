import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Table, Field } from '../types';

interface EditTableSchemaProps {
  table: Table;
  fieldTypes: string[];
  allTables: Record<string, Table>;
  onSave: (fields: Field[]) => void;
  onCancel: () => void;
}

export const EditTableSchema: React.FC<EditTableSchemaProps> = ({
  table,
  fieldTypes,
  allTables,
  onSave,
  onCancel
}) => {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    // Initialize with existing fields
    setFields([...table.fields]);
  }, [table]);

  const updateField = (index: number, updates: Partial<Field>) => {
    // Don't allow updating the id field
    if (index === 0 && fields[0].name === 'id') {
      return;
    }
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const addField = () => {
    setFields([...fields, { 
      name: '', 
      type: 'string', 
      required: false,
      unique: false,
      primaryKey: false
    }]);
  };

  const removeField = (index: number) => {
    // Don't allow removing the id field
    if (index === 0 && fields[0].name === 'id') {
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate that all fields have names
    if (fields.some(f => !f.name)) {
      alert('All fields must have a name');
      return;
    }
    onSave(fields);
  };

  return (
    <>
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-6">
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
              {fields.map((field, index) => (
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
                      updateField(index, { type: e.target.value as any });
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
                        {Object.values(allTables).map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      
                      <select
                        value={field.relationshipType || ''}
                        onChange={(e) => updateField(index, { relationshipType: e.target.value as any })}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Type...</option>
                        <option value="oneToMany">One to Many</option>
                        <option value="manyToOne">Many to One</option>
                        <option value="manyToMany">Many to Many</option>
                      </select>
                    </>
                  )}
                  
                  {fields.length > 1 && !(index === 0 && field.name === 'id') && (
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
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={fields.some(f => !f.name)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </>
  );
};