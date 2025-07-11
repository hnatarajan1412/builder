import React, { useState } from 'react';
import { Calculator, Plus, Minus, X as Times, Divide, Percent, DollarSign } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { FormulaEvaluator } from '../utils/formulaEvaluator';

interface FormulaBuilderProps {
  onFormulaCreate: (formula: string) => void;
  trigger: React.ReactNode;
  context?: Record<string, any>;
}

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  onFormulaCreate,
  trigger,
  context = {}
}) => {
  const [formula, setFormula] = useState('');
  const [previewResult, setPreviewResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  const handleFormulaChange = (value: string) => {
    setFormula(value);
    setError('');
    
    // Try to evaluate the formula for preview
    try {
      const result = FormulaEvaluator.evaluate(value, context);
      setPreviewResult(String(result));
    } catch (err) {
      setPreviewResult('');
      setError(err.message || 'Invalid formula');
    }
  };

  const insertOperator = (op: string) => {
    setFormula(prev => prev + ` ${op} `);
  };

  const insertFunction = (func: string) => {
    setFormula(prev => prev + `${func}()`);
  };

  const insertVariable = (variable: string) => {
    setFormula(prev => prev + `{${variable}}`);
  };

  const handleCreate = () => {
    if (formula && !error) {
      onFormulaCreate(`formula:${formula}`);
      setFormula('');
      setPreviewResult('');
    }
  };

  const commonFunctions = [
    { name: 'round', desc: 'Round to nearest integer' },
    { name: 'floor', desc: 'Round down' },
    { name: 'ceil', desc: 'Round up' },
    { name: 'abs', desc: 'Absolute value' },
    { name: 'sqrt', desc: 'Square root' },
    { name: 'pow', desc: 'Power (e.g., pow(2, 3) = 8)' },
    { name: 'min', desc: 'Minimum value' },
    { name: 'max', desc: 'Maximum value' },
    { name: 'sum', desc: 'Sum of values' },
    { name: 'avg', desc: 'Average of values' },
    { name: 'if', desc: 'Conditional (if(condition, true, false))' },
  ];

  const templates = Object.entries(FormulaEvaluator.templates).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    formula: value
  }));

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-hidden z-50">
          <div className="p-6">
            <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Formula Builder
            </Dialog.Title>
            
            {/* Formula Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formula Expression
              </label>
              <textarea
                value={formula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
                placeholder="e.g., {price} * {quantity} * (1 - {discount} / 100)"
              />
              {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
              )}
              {previewResult && !error && (
                <p className="text-green-600 text-sm mt-1">
                  Preview result: {previewResult}
                </p>
              )}
            </div>
            
            {/* Quick Operators */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Operators</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => insertOperator('+')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertOperator('-')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertOperator('*')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Times className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertOperator('/')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Divide className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertOperator('%')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  <Percent className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertOperator('^')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  ^
                </button>
              </div>
            </div>
            
            {/* Functions */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Functions</h4>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {commonFunctions.map((func) => (
                  <button
                    key={func.name}
                    onClick={() => insertFunction(func.name)}
                    className="text-left px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                    title={func.desc}
                  >
                    {func.name}()
                  </button>
                ))}
              </div>
            </div>
            
            {/* Templates */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Formula Templates</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => setFormula(template.formula)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{template.formula}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Help */}
            <div className="mb-4">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showHelp ? 'Hide' : 'Show'} Help
              </button>
              
              {showHelp && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                  <p className="mb-2">
                    <strong>Variables:</strong> Use {`{variable_name}`} to reference data fields
                  </p>
                  <p className="mb-2">
                    <strong>Arrays:</strong> Use functions like sum(), avg(), count() on array fields
                  </p>
                  <p className="mb-2">
                    <strong>Conditionals:</strong> if(condition, true_value, false_value)
                  </p>
                  <p>
                    <strong>Example:</strong> {`if({quantity} > 10, {price} * 0.9, {price})`}
                  </p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <button
                  onClick={handleCreate}
                  disabled={!formula || !!error}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Formula
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};