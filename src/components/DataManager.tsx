import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { databaseService } from '../services/database-compat.service';
import { Table } from '../types';

interface DataManagerProps {
  table: Table;
  appId: string;
}

export const DataManager: React.FC<DataManagerProps> = ({ table, appId }) => {
  const [data, setData] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [table.id]);

  const loadData = () => {
    const result = databaseService.query(appId, table.name);
    setData(result.rows);
  };

  const handleAdd = () => {
    const row = { ...newRow };
    
    // Ensure required fields have values
    table.fields.forEach(field => {
      if (!row[field.name] && field.type === 'boolean') {
        row[field.name] = false;
      } else if (!row[field.name] && field.type === 'number') {
        row[field.name] = 0;
      }
    });
    
    databaseService.insert(appId, table.name, row);
    setNewRow({});
    setIsAdding(false);
    loadData();
  };

  const handleUpdate = (id: string) => {
    databaseService.update(appId, table.name, id, editingData);
    setEditingId(null);
    setEditingData({});
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      databaseService.delete(appId, table.name, id);
      loadData();
    }
  };

  const renderCellValue = (value: any, field: any) => {
    if (value === null || value === undefined) return '-';
    
    switch (field.type) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'json':
        return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
      case 'date':
      case 'datetime':
        return new Date(value).toLocaleString();
      default:
        return String(value);
    }
  };

  const renderInput = (field: any, value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        );
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            rows={3}
          />
        );
      case 'json':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            className="w-full px-2 py-1 text-sm font-mono border border-gray-300 rounded"
            rows={3}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        );
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange(new Date(e.target.value).toISOString())}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        );
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{table.name} Data</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              {table.fields.map((field) => (
                <th
                  key={field.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isAdding && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Auto
                </td>
                {table.fields.map((field) => (
                  <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderInput(field, newRow[field.name], (val) =>
                      setNewRow({ ...newRow, [field.name]: val })
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={handleAdd}
                    className="text-green-600 hover:text-green-900 mr-2"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewRow({});
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.id}
                </td>
                {table.fields.map((field) => (
                  <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === row.id ? (
                      renderInput(
                        field,
                        editingData[field.name] ?? row[field.name],
                        (val) => setEditingData({ ...editingData, [field.name]: val })
                      )
                    ) : (
                      renderCellValue(row[field.name], field)
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === row.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(row.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingData({});
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(row.id);
                          setEditingData(row);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && !isAdding && (
              <tr>
                <td
                  colSpan={table.fields.length + 2}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No data yet. Click "Add Record" to create your first entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};