import React, { useState, useRef, useEffect } from 'react';
import { Calculator, X, Settings } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';
import { MagicTextFormatPanel } from './MagicTextFormatPanel';
import { MagicTextPicker } from './MagicTextPicker';

interface MagicTextEditorProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  context?: 'repeater' | 'list' | 'default';
  dataType?: 'collection' | 'singleton' | 'any';
}

interface MagicTextToken {
  type: 'text' | 'variable' | 'formula';
  value: string;
  display?: string;
  path?: string;
  format?: string;
}

export const MagicTextEditor: React.FC<MagicTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type text or click + to add dynamic content',
  multiline = false,
  context,
  dataType = 'any'
}) => {
  const [tokens, setTokens] = useState<MagicTextToken[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Parse value into tokens on mount and when value changes externally
  useEffect(() => {
    parseValueToTokens(value || '');
  }, [value]);

  const parseValueToTokens = (text: string) => {
    // Ensure text is a string
    const textStr = String(text || '');
    const regex = /\{\{([^}]+)\}\}/g;
    const newTokens: MagicTextToken[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(textStr)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        newTokens.push({
          type: 'text',
          value: textStr.substring(lastIndex, match.index)
        });
      }

      // Add the variable token
      const variable = match[1];
      
      // Check if it has formatting
      const formatMatch = variable.match(/^(.+)\|(.+)$/);
      let path: string;
      let format: string | undefined;
      
      if (formatMatch) {
        path = formatMatch[1].trim();
        format = formatMatch[2].trim();
      } else {
        path = variable;
      }
      
      if (path.startsWith('formula:')) {
        newTokens.push({
          type: 'formula',
          value: variable,
          display: path.replace('formula:', ''),
          path: path,
          format
        });
      } else {
        newTokens.push({
          type: 'variable',
          value: variable,
          display: path.split('.').pop() || path,
          path: path,
          format
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < textStr.length) {
      newTokens.push({
        type: 'text',
        value: textStr.substring(lastIndex)
      });
    }

    setTokens(newTokens);
  };

  const tokensToValue = (tokenList: MagicTextToken[]): string => {
    return tokenList.map(token => {
      if (token.type === 'variable' || token.type === 'formula') {
        const pathPart = token.path || token.value;
        const formatPart = token.format ? `|${token.format}` : '';
        return `{{${pathPart}${formatPart}}}`;
      }
      return token.value;
    }).join('');
  };

  const handleTextChange = (index: number, newValue: string) => {
    const newTokens = [...tokens];
    newTokens[index] = { ...newTokens[index], value: newValue };
    setTokens(newTokens);
    onChange(tokensToValue(newTokens));
  };

  const insertToken = (token: MagicTextToken) => {
    const newTokens = [...tokens];
    
    // Find where to insert based on cursor position
    let insertIndex = 0;
    let charCount = 0;
    
    for (let i = 0; i < tokens.length; i++) {
      const tokenLength = tokens[i].value.length;
      if (charCount + tokenLength >= cursorPosition) {
        // Split the current token if it's text
        if (tokens[i].type === 'text') {
          const splitPoint = cursorPosition - charCount;
          const beforeText = tokens[i].value.substring(0, splitPoint);
          const afterText = tokens[i].value.substring(splitPoint);
          
          const newTokensList = [];
          if (beforeText) {
            newTokensList.push({ type: 'text' as const, value: beforeText });
          }
          newTokensList.push(token);
          if (afterText) {
            newTokensList.push({ type: 'text' as const, value: afterText });
          }
          
          newTokens.splice(i, 1, ...newTokensList);
        } else {
          // Insert after the current token
          newTokens.splice(i + 1, 0, token);
        }
        break;
      }
      charCount += tokenLength;
      insertIndex = i + 1;
    }
    
    // If we've reached the end, add the token
    if (insertIndex === tokens.length) {
      newTokens.push(token);
    }
    
    setTokens(newTokens);
    onChange(tokensToValue(newTokens));
    setShowPicker(false);
  };

  const removeToken = (index: number) => {
    const newTokens = tokens.filter((_, i) => i !== index);
    setTokens(newTokens);
    onChange(tokensToValue(newTokens));
  };

  const applyFormatToToken = (index: number, format: string) => {
    const newTokens = [...tokens];
    if (newTokens[index] && (newTokens[index].type === 'variable' || newTokens[index].type === 'formula')) {
      newTokens[index] = { ...newTokens[index], format };
      setTokens(newTokens);
      onChange(tokensToValue(newTokens));
    }
  };


  const handleAddClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPosition({ 
        top: rect.bottom + 5, 
        left: rect.left 
      });
      setShowPicker(true);
    }
  };

  const handleMagicTextSelect = (value: string) => {
    // Extract the content between {{ and }}
    const match = value.match(/\{\{(.+)\}\}/);
    if (match) {
      const path = match[1];
      
      // Determine if it's a formula or variable
      const isFormula = path.startsWith('formula:');
      
      insertToken({
        type: isFormula ? 'formula' : 'variable',
        value: path,
        display: path.split('.').pop() || path,
        path: path
      });
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div 
            ref={editorRef}
            className="min-h-[40px] p-2 border border-gray-300 rounded-md bg-white flex flex-wrap items-center gap-1"
          >
            {tokens.length === 0 && (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
            {tokens.map((token, index) => (
              <React.Fragment key={index}>
                {token.type === 'text' ? (
                  <input
                    type="text"
                    value={token.value}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="outline-none flex-1 min-w-[50px]"
                    placeholder={index === 0 ? placeholder : ''}
                    onFocus={(e) => setCursorPosition(e.target.selectionStart || 0)}
                  />
                ) : (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    token.type === 'variable' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {token.type === 'formula' && <Calculator className="w-3 h-3" />}
                    {token.display}
                    {token.format && (
                      <span className="text-xs opacity-75">|{token.format.split(':')[0]}</span>
                    )}
                    <MagicTextFormatPanel
                      onFormatSelect={(format) => applyFormatToToken(index, format)}
                      trigger={
                        <button
                          className="ml-1 hover:bg-white/50 rounded p-0.5"
                          title="Format options"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                      }
                    />
                    <button
                      onClick={() => removeToken(index)}
                      className="ml-1 hover:bg-white/50 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <button
          ref={buttonRef}
          onClick={handleAddClick}
          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Insert dynamic content"
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>
      
      {showPicker && (
        <MagicTextPicker
          onSelect={handleMagicTextSelect}
          onClose={() => setShowPicker(false)}
          position={pickerPosition}
          context={context || 'default'}
          dataType={dataType}
        />
      )}
      
      <div className="mt-1 text-xs text-gray-500">
        {dataType === 'collection' ? (
          'Use table names like {{products}} or {{users}} for collections'
        ) : dataType === 'singleton' ? (
          'Use single values like {{user.name}} or {{products[0].price}}'
        ) : (
          'Dynamic content will be replaced with actual values in preview mode'
        )}
      </div>
    </div>
  );
};