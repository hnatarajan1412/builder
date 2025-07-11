import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  User, 
  Database, 
  Calendar, 
  Hash,
  Type,
  ToggleLeft,
  Clock,
  X,
  ChevronRight,
  Table2,
  Globe,
  Zap
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { useUserStore } from '../stores/user.store';

interface MagicTextPickerProps {
  onSelect: (value: string) => void;
  onClose: () => void;
  context?: 'repeater' | 'list' | 'default';
  position?: { top: number; left: number };
  dataType?: 'collection' | 'singleton' | 'any';
}

interface MagicTextCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: MagicTextItem[];
}

interface MagicTextItem {
  label: string;
  value: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  description?: string;
  children?: MagicTextItem[];
}

export const MagicTextPicker: React.FC<MagicTextPickerProps> = ({ 
  onSelect, 
  onClose,
  context = 'default',
  position,
  dataType = 'any'
}) => {
  const { tables, currentApp, currentPage } = useBuilderStore();
  const { loggedInUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Build categories
  const categories: MagicTextCategory[] = [];

  // User category (only for singleton or any)
  if (dataType === 'singleton' || dataType === 'any') {
    categories.push({
      id: 'user',
      name: 'User',
      icon: <User className="w-4 h-4" />,
      items: [
        { label: 'Name', value: 'user.name', type: 'string' },
        { label: 'Email', value: 'user.email', type: 'string' },
        { label: 'ID', value: 'user.id', type: 'string' },
        { label: 'Role', value: 'user.role', type: 'string' }
      ]
    });
  }

  // Current Item (for repeater context)
  if (context === 'repeater' || context === 'list') {
    categories.push({
      id: 'current',
      name: 'Current Item',
      icon: <Zap className="w-4 h-4" />,
      items: [
        { label: 'Current Item', value: 'item', type: 'string', description: 'Access current item properties' },
        { label: 'Item Index', value: 'index', type: 'number', description: 'Position in the list' }
      ]
    });
  }

  // Database tables
  if (currentApp) {
    const appTables = Object.values(tables).filter(table => table.appId === currentApp.id);
    
    appTables.forEach(table => {
      const tableItems: MagicTextItem[] = [];
      
      // For collection data types, show the table itself
      if (dataType === 'collection' || dataType === 'any') {
        tableItems.push({
          label: `All ${table.name}`,
          value: table.name,
          type: 'array',
          description: 'Entire collection'
        });
      }
      
      // For singleton or any, show individual field access
      if (dataType === 'singleton' || dataType === 'any') {
        // Add count aggregation
        tableItems.push({
          label: `${table.name} count`,
          value: `${table.name}.count()`,
          type: 'number',
          description: 'Number of records'
        });
        
        // Add first item fields
        table.fields.forEach(field => {
          if (field.name !== 'id') {
            tableItems.push({
              label: `First ${field.name}`,
              value: `${table.name}[0].${field.name}`,
              type: field.type as any,
              description: `First ${table.name} ${field.name}`
            });
          }
        });

        // Add aggregations for number fields
        const numberFields = table.fields.filter(f => f.type === 'number');
        if (numberFields.length > 0) {
          numberFields.forEach(field => {
            tableItems.push({
              label: `Sum of ${field.name}`,
              value: `${table.name}.sum(${field.name})`,
              type: 'number'
            });
            tableItems.push({
              label: `Average ${field.name}`,
              value: `${table.name}.avg(${field.name})`,
              type: 'number'
            });
          });
        }
      }

      if (tableItems.length > 0) {
        categories.push({
          id: table.id,
          name: table.name,
          icon: <Table2 className="w-4 h-4" />,
          items: tableItems
        });
      }
    });
  }

  // Date & Time (only for singleton or any)
  if (dataType === 'singleton' || dataType === 'any') {
    categories.push({
      id: 'datetime',
      name: 'Date & Time',
      icon: <Calendar className="w-4 h-4" />,
      items: [
        { label: 'Current Date & Time', value: 'now', type: 'date' },
        { label: 'Today', value: 'today', type: 'date' },
        { label: 'Tomorrow', value: 'tomorrow', type: 'date' },
        { label: 'Yesterday', value: 'yesterday', type: 'date' },
        { label: 'Current Time', value: 'now.time', type: 'date' },
        { label: 'Current Date', value: 'now.date', type: 'date' }
      ]
    });
  }

  // Page State (only for singleton or any)
  if (currentPage && (dataType === 'singleton' || dataType === 'any')) {
    categories.push({
      id: 'state',
      name: 'Page State',
      icon: <Globe className="w-4 h-4" />,
      items: [
        { label: 'Page Name', value: 'currentPage.name', type: 'string' },
        { label: 'Page Path', value: 'currentPage.path', type: 'string' }
      ]
    });
  }

  // Filter items based on search
  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleItemClick = (item: MagicTextItem) => {
    if (item.children && item.children.length > 0) {
      const key = item.value;
      setExpandedItems(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    } else {
      onSelect(`{{${item.value}}}`);
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string':
      case 'text':
        return <Type className="w-3 h-3" />;
      case 'number':
        return <Hash className="w-3 h-3" />;
      case 'date':
      case 'datetime':
        return <Calendar className="w-3 h-3" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3" />;
      case 'array':
        return <Database className="w-3 h-3" />;
      default:
        return <Type className="w-3 h-3" />;
    }
  };

  const renderItem = (item: MagicTextItem, level = 0) => {
    const isExpanded = expandedItems.has(item.value);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.value}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${
            level > 0 ? 'pl-6' : ''
          }`}
        >
          {hasChildren && (
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
          {!hasChildren && <div className="w-3" />}
          <span className="text-gray-400">{getTypeIcon(item.type)}</span>
          <span className="flex-1">{item.label}</span>
          {item.description && (
            <span className="text-xs text-gray-500">{item.description}</span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={pickerRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden z-50"
      style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Insert Magic Text</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search magic text..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex h-80">
        {/* Category List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {filteredCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-50 ${
                selectedCategory === category.id ? 'bg-indigo-50 text-indigo-700' : ''
              }`}
            >
              <span className={selectedCategory === category.id ? 'text-indigo-600' : 'text-gray-400'}>
                {category.icon}
              </span>
              <span className="flex-1">{category.name}</span>
              <span className="text-xs text-gray-500">{category.items.length}</span>
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {selectedCategory ? (
            <div>
              {filteredCategories
                .find(c => c.id === selectedCategory)
                ?.items.map(item => renderItem(item))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              Select a category to browse magic text options
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          Click to insert • Use | for formatting (e.g., {'{{price|currency}}'})
        </p>
      </div>
    </div>
  );
};