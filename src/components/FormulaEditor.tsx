import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Function, 
  Variable, 
  Database,
  HelpCircle,
  Play,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';

interface FormulaEditorProps {
  value: string;
  onChange: (formula: string) => void;
  context?: 'property' | 'binding' | 'validation';
  placeholder?: string;
}

const formulaFunctions = [
  {
    category: 'Math',
    functions: [
      { name: 'SUM', syntax: 'SUM(value1, value2, ...)', description: 'Adds numbers together' },
      { name: 'AVG', syntax: 'AVG(value1, value2, ...)', description: 'Calculates average' },
      { name: 'MIN', syntax: 'MIN(value1, value2, ...)', description: 'Returns minimum value' },
      { name: 'MAX', syntax: 'MAX(value1, value2, ...)', description: 'Returns maximum value' },
      { name: 'ROUND', syntax: 'ROUND(number, decimals)', description: 'Rounds a number' },
      { name: 'ABS', syntax: 'ABS(number)', description: 'Returns absolute value' }
    ]
  },
  {
    category: 'Text',
    functions: [
      { name: 'CONCAT', syntax: 'CONCAT(text1, text2, ...)', description: 'Joins text strings' },
      { name: 'UPPER', syntax: 'UPPER(text)', description: 'Converts to uppercase' },
      { name: 'LOWER', syntax: 'LOWER(text)', description: 'Converts to lowercase' },
      { name: 'LEN', syntax: 'LEN(text)', description: 'Returns text length' },
      { name: 'TRIM', syntax: 'TRIM(text)', description: 'Removes spaces' },
      { name: 'REPLACE', syntax: 'REPLACE(text, find, replace)', description: 'Replaces text' }
    ]
  },
  {
    category: 'Logic',
    functions: [
      { name: 'IF', syntax: 'IF(condition, true_value, false_value)', description: 'Conditional logic' },
      { name: 'AND', syntax: 'AND(condition1, condition2, ...)', description: 'All conditions true' },
      { name: 'OR', syntax: 'OR(condition1, condition2, ...)', description: 'Any condition true' },
      { name: 'NOT', syntax: 'NOT(condition)', description: 'Inverts boolean' },
      { name: 'ISEMPTY', syntax: 'ISEMPTY(value)', description: 'Checks if empty' }
    ]
  },
  {
    category: 'Date',
    functions: [
      { name: 'NOW', syntax: 'NOW()', description: 'Current date and time' },
      { name: 'TODAY', syntax: 'TODAY()', description: 'Current date' },
      { name: 'DATE', syntax: 'DATE(year, month, day)', description: 'Creates a date' },
      { name: 'DATEADD', syntax: 'DATEADD(date, number, unit)', description: 'Adds to date' },
      { name: 'DATEDIFF', syntax: 'DATEDIFF(date1, date2, unit)', description: 'Date difference' }
    ]
  }
];

export const FormulaEditor: React.FC<FormulaEditorProps> = ({
  value,
  onChange,
  context = 'property',
  placeholder = 'Enter formula or expression...'
}) => {
  const { tables, currentApp } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formula, setFormula] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Math');
  
  const appTables = currentApp 
    ? Object.values(tables).filter(table => table.appId === currentApp.id)
    : [];
  
  useEffect(() => {
    setFormula(value);
  }, [value]);
  
  const validateFormula = (formula: string): boolean => {
    try {
      // Basic validation - check for balanced parentheses
      let depth = 0;
      for (const char of formula) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth < 0) {
          setError('Unmatched closing parenthesis');
          return false;
        }
      }
      if (depth > 0) {
        setError('Unmatched opening parenthesis');
        return false;
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError('Invalid formula syntax');
      return false;
    }
  };
  
  const handleSave = () => {
    if (validateFormula(formula)) {
      onChange(formula);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setFormula(value);
    setError(null);
    setIsEditing(false);
  };
  
  const insertFunction = (func: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || formula.length;
    const newFormula = formula.slice(0, cursorPos) + func + formula.slice(cursorPos);
    setFormula(newFormula);
  };
  
  const insertVariable = (variable: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || formula.length;
    const newFormula = formula.slice(0, cursorPos) + `{{${variable}}}` + formula.slice(cursorPos);
    setFormula(newFormula);
  };
  
  if (!isEditing) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      >
        {value ? (
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <code className="text-sm text-gray-700">{value}</code>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Click to add formula...</div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Formula Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-700">Formula</label>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            Help
          </button>
        </div>
        <textarea
          value={formula}
          onChange={(e) => {
            setFormula(e.target.value);
            validateFormula(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          autoFocus
        />
        {error && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
      
      {/* Quick Insert */}
      <div className="space-y-2">
        {/* Variables */}
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Variables</h4>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => insertVariable('currentUser')}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            >
              <Variable className="w-3 h-3 inline mr-1" />
              currentUser
            </button>
            <button
              onClick={() => insertVariable('currentDate')}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            >
              <Variable className="w-3 h-3 inline mr-1" />
              currentDate
            </button>
            <button
              onClick={() => insertVariable('appState')}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            >
              <Variable className="w-3 h-3 inline mr-1" />
              appState
            </button>
          </div>
        </div>
        
        {/* Table Fields */}
        {appTables.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Table Fields</h4>
            <select
              onChange={(e) => e.target.value && insertVariable(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
            >
              <option value="">Select field...</option>
              {appTables.map(table => (
                <optgroup key={table.id} label={table.name}>
                  {table.fields.map(field => (
                    <option key={field.name} value={`${table.name}.${field.name}`}>
                      {field.name} ({field.type})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Functions Helper */}
      {showHelp && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex gap-2 mb-2">
            {formulaFunctions.map(cat => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedCategory === cat.category
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {formulaFunctions
              .find(cat => cat.category === selectedCategory)
              ?.functions.map(func => (
                <button
                  key={func.name}
                  onClick={() => insertFunction(func.syntax)}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-white rounded transition-colors"
                >
                  <div className="font-mono text-indigo-600">{func.syntax}</div>
                  <div className="text-gray-500">{func.description}</div>
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!!error}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          Apply
        </button>
      </div>
    </div>
  );
};