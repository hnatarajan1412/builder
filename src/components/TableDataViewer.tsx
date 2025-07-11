import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Check
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { hybridDatabaseService } from '../services/hybrid-database.service';

export const TableDataViewer: React.FC = () => {
  const { 
    currentApp, 
    selectedTable, 
    setSelectedTable, 
    setSidePanelMode,
    tables 
  } = useBuilderStore();
  
  const [data, setData] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  const table = selectedTable ? tables[selectedTable] : null;

  useEffect(() => {
    if (currentApp && table) {
      loadData();
    }
  }, [currentApp, table]);

  const loadData = async () => {
    if (!currentApp || !table) return;
    try {
      const tableData = await hybridDatabaseService.getAllData(currentApp.id, table.name);
      setData(tableData);
    } catch (error) {
      console.error('Error loading table data:', error);
    }
  };

  const handleEdit = (row: any) => {
    setEditingRow(row.id);
    setEditValues(row);
  };

  const handleSave = async () => {
    if (!currentApp || !table || !editingRow) return;
    
    try {
      await hybridDatabaseService.update(currentApp.id, table.name, editingRow, editValues);
      await loadData();
      setEditingRow(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentApp || !table) return;
    
    if (window.confirm('Delete this record?')) {
      try {
        await hybridDatabaseService.delete(currentApp.id, table.name, id);
        await loadData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleAddRow = async () => {
    if (!currentApp || !table) return;
    
    try {
      // Don't manually add ID - let the database service handle it
      await hybridDatabaseService.insert(currentApp.id, table.name, newRowData);
      await loadData();
      setShowAddRow(false);
      setNewRowData({});
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!table) {
    return (
      <div className="p-4">
        <p className="text-gray-500">No table selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidePanelMode('database');
                setSelectedTable(null);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900">{table.name}</h3>
            <span className="text-sm text-gray-500">{data.length} records</span>
          </div>
          
          <button
            onClick={() => setShowAddRow(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {table.fields.map(field => (
                <th key={field.name} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {field.name}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add Row Form */}
            {showAddRow && (
              <tr className="bg-indigo-50">
                {table.fields.map(field => (
                  <td key={field.name} className="px-4 py-3">
                    {field.readOnly ? (
                      <span className="px-2 py-1 text-sm text-gray-500 italic">Auto-generated</span>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={newRowData[field.name] || ''}
                        onChange={(e) => setNewRowData({
                          ...newRowData,
                          [field.name]: e.target.value
                        })}
                        placeholder={field.name}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleAddRow}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRow(false);
                        setNewRowData({});
                      }}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {filteredData.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {table.fields.map(field => (
                  <td key={field.name} className="px-4 py-3 text-sm text-gray-900">
                    {editingRow === row.id && !field.readOnly ? (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={editValues[field.name] || ''}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [field.name]: e.target.value
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span>{row[field.name] || '-'}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editingRow === row.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRow(null);
                            setEditValues({});
                          }}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && !showAddRow && (
              <tr>
                <td colSpan={table.fields.length + 1} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No matching records found' : 'No data yet. Add your first row!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};