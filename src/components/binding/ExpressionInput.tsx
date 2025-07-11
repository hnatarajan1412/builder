import React, { useState, useRef, useEffect } from 'react';
import { DataSourceTree, AutoCompleteSuggestion, PropertyType } from '../../types/binding.types';

interface ExpressionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dataSources: DataSourceTree;
  propertyType: PropertyType;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
  value,
  onChange,
  placeholder = 'Click to bind...',
  dataSources,
  propertyType
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions based on current input
  const generateSuggestions = (input: string, position: number): AutoCompleteSuggestion[] => {
    const beforeCursor = input.substring(0, position);
    const match = beforeCursor.match(/\{\{([^}]*)$/);
    
    if (!match) return [];
    
    const partial = match[1].trim();
    const parts = partial.split('.');
    const allSuggestions: AutoCompleteSuggestion[] = [];

    // If we're at the root level
    if (parts.length === 1) {
      Object.entries(dataSources).forEach(([category, nodes]) => {
        nodes.forEach(node => {
          if (node.id.toLowerCase().includes(parts[0].toLowerCase())) {
            allSuggestions.push({
              label: node.label,
              value: node.id,
              type: node.type,
              category: node.category,
              description: node.description,
              insertText: node.id,
              detail: `${category} > ${node.label}`
            });
          }
        });
      });
    } else {
      // Navigate through the tree based on parts
      const rootPart = parts[0];
      let currentNodes: any[] = [];

      // Find the root node
      Object.values(dataSources).forEach(nodes => {
        const rootNode = nodes.find(n => n.id === rootPart || n.path[0] === rootPart);
        if (rootNode && rootNode.children) {
          currentNodes = rootNode.children;
        }
      });

      // Navigate to the current level
      for (let i = 1; i < parts.length - 1; i++) {
        const part = parts[i];
        const node = currentNodes.find(n => n.path[n.path.length - 1] === part);
        if (node && node.children) {
          currentNodes = node.children;
        } else {
          currentNodes = [];
          break;
        }
      }

      // Generate suggestions for current level
      const searchTerm = parts[parts.length - 1].toLowerCase();
      currentNodes.forEach(node => {
        if (node.label.toLowerCase().includes(searchTerm)) {
          const fullPath = [...parts.slice(0, -1), node.path[node.path.length - 1]].join('.');
          allSuggestions.push({
            label: node.label,
            value: fullPath,
            type: node.type,
            category: node.category,
            description: node.description,
            insertText: fullPath,
            detail: node.type
          });
        }
      });
    }

    return allSuggestions;
  };

  useEffect(() => {
    if (isFocused && value.includes('{{') && !value.includes('}}', value.lastIndexOf('{{'))) {
      const newSuggestions = generateSuggestions(value, cursorPosition);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, cursorPosition, isFocused, dataSources]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertSuggestion = (suggestion: AutoCompleteSuggestion) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const match = beforeCursor.match(/\{\{([^}]*)$/);
    
    if (match) {
      const startPos = match.index! + 2;
      const newValue = value.substring(0, startPos) + suggestion.insertText + '}}' + afterCursor;
      onChange(newValue);
      setShowSuggestions(false);
      
      // Set cursor position after the inserted text
      setTimeout(() => {
        if (inputRef.current) {
          const newPos = startPos + suggestion.insertText.length + 2;
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart || 0;
    setCursorPosition(newCursorPos);
    onChange(newValue);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      />
      
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.category}-${suggestion.value}`}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertSuggestion(suggestion);
              }}
            >
              <div>
                <div className="font-medium">{suggestion.label}</div>
                {suggestion.description && (
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {suggestion.detail || suggestion.type}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {value && !value.trim() && (
        <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
          <span className="text-gray-400 text-sm font-normal">Click to bind...</span>
        </div>
      )}
    </div>
  );
};