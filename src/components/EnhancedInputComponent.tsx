import React from 'react';
import { ComponentInstance } from '../types';

interface EnhancedInputComponentProps {
  component: ComponentInstance;
  isPreview?: boolean;
  onChange?: (value: any) => void;
}

export const EnhancedInputComponent: React.FC<EnhancedInputComponentProps> = ({
  component,
  isPreview = false,
  onChange
}) => {
  const { props = {}, style = {} } = component;
  
  const inputType = props.type || 'text';
  const placeholder = props.placeholder || 'Enter text...';
  const value = props.value || '';
  const required = props.required || false;
  const disabled = props.disabled || false;
  const name = props.name || `input_${component.id}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

  // Handle different input types
  switch (inputType) {
    case 'textarea':
      return (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || !isPreview}
          rows={props.rows || 3}
          style={style}
          className={baseInputClasses}
        />
      );
      
    case 'select':
      return (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled || !isPreview}
          style={style}
          className={baseInputClasses}
        >
          <option value="">{placeholder}</option>
          {props.options?.map((option: any, index: number) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      );
      
    case 'checkbox':
      return (
        <label className="flex items-center space-x-2" style={style}>
          <input
            type="checkbox"
            name={name}
            checked={value || false}
            onChange={(e) => onChange && onChange(e.target.checked)}
            required={required}
            disabled={disabled || !isPreview}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-900">{props.label || 'Checkbox'}</span>
        </label>
      );
      
    case 'radio':
      return (
        <div className="space-y-2" style={style}>
          {props.options?.map((option: any, index: number) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={name}
                value={option.value || option}
                checked={value === (option.value || option)}
                onChange={handleChange}
                required={required}
                disabled={disabled || !isPreview}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-900">{option.label || option}</span>
            </label>
          ))}
        </div>
      );
      
    case 'file':
      return (
        <input
          type="file"
          name={name}
          onChange={handleChange}
          required={required}
          disabled={disabled || !isPreview}
          accept={props.accept}
          multiple={props.multiple || false}
          style={style}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      );
      
    default:
      return (
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || !isPreview}
          style={style}
          className={baseInputClasses}
        />
      );
  }
};