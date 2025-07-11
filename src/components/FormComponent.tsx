import React, { useState } from 'react';
import { ComponentInstance } from '../types';
import { ComponentRenderer } from './ComponentRenderer';
import { useBuilderStore } from '../stores/builder.store';
import { databaseService } from '../services/database-compat.service';

interface FormComponentProps {
  component: ComponentInstance;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<ComponentInstance>) => void;
  isPreview?: boolean;
}

export const FormComponent: React.FC<FormComponentProps> = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  isPreview = false
}) => {
  const { currentApp } = useBuilderStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { props = {} } = component;
  
  // Form configuration
  const submitAction = props.submitAction || 'database';
  const targetTable = props.targetTable;
  const submitButtonText = props.submitButtonText || 'Submit';
  const resetAfterSubmit = props.resetAfterSubmit !== false;

  // Collect form fields from children
  const collectFormFields = (children: ComponentInstance[] = []): ComponentInstance[] => {
    const fields: ComponentInstance[] = [];
    
    for (const child of children) {
      if (child.componentId === 'input' || child.componentId === 'textarea' || child.componentId === 'select') {
        fields.push(child);
      }
      // Recursively check nested children
      if (child.children) {
        fields.push(...collectFormFields(child.children));
      }
    }
    
    return fields;
  };

  const formFields = collectFormFields(component.children);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPreview) return; // Only handle submissions in preview mode
    
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      if (submitAction === 'database' && targetTable && currentApp) {
        // Submit to database
        const record = {
          id: `record-${Date.now()}`,
          ...formData,
          created_at: new Date().toISOString()
        };
        
        databaseService.insertData(currentApp.id, targetTable, record);
        
        setSubmitMessage({ type: 'success', text: 'Form submitted successfully!' });
        
        if (resetAfterSubmit) {
          setFormData({});
        }
      } else if (submitAction === 'api') {
        // Submit to API endpoint
        const apiUrl = props.apiUrl;
        if (apiUrl) {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          if (response.ok) {
            setSubmitMessage({ type: 'success', text: 'Form submitted successfully!' });
            if (resetAfterSubmit) {
              setFormData({});
            }
          } else {
            throw new Error('API submission failed');
          }
        }
      } else {
        // Just show the data (for testing)
        console.log('Form data:', formData);
        setSubmitMessage({ type: 'success', text: 'Form data logged to console' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage({ type: 'error', text: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced children with form bindings
  const enhanceChildrenWithFormBindings = (children: ComponentInstance[] = []): ComponentInstance[] => {
    return children.map(child => {
      if (child.componentId === 'input' || child.componentId === 'textarea' || child.componentId === 'select') {
        const fieldName = child.props?.name || child.props?.placeholder || `field_${child.id}`;
        
        return {
          ...child,
          props: {
            ...child.props,
            name: fieldName,
            value: formData[fieldName] || '',
            onChange: (value: any) => handleInputChange(fieldName, value)
          }
        };
      }
      
      // Recursively enhance nested children
      if (child.children) {
        return {
          ...child,
          children: enhanceChildrenWithFormBindings(child.children)
        };
      }
      
      return child;
    });
  };

  const enhancedChildren = isPreview ? enhanceChildrenWithFormBindings(component.children) : component.children;

  if (!isPreview) {
    // Builder mode - show form structure
    return (
      <div 
        className={`form-container border-2 border-dashed rounded-lg p-4 min-h-[200px] ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={onSelect}
      >
        <div className="form-header mb-4">
          <h3 className="text-sm font-medium text-gray-700">Form Component</h3>
          <p className="text-xs text-gray-500">
            Submit to: {submitAction === 'database' ? `Table: ${targetTable || 'Not configured'}` : submitAction}
          </p>
        </div>
        
        {/* Render form children */}
        <div className="form-children space-y-3">
          {component.children?.map((child, index) => (
            <ComponentRenderer
              key={child.id}
              component={child}
              isPreview={false}
            />
          ))}
        </div>
        
        {/* Form submit button placeholder */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
            disabled
          >
            {submitButtonText}
          </button>
          <p className="text-xs text-gray-500 mt-1">Submit button (preview mode only)</p>
        </div>
      </div>
    );
  }

  // Preview mode - functional form
  return (
    <form onSubmit={handleSubmit} className="form-container space-y-4">
      {/* Render enhanced form children */}
      {enhancedChildren?.map((child, index) => (
        <ComponentRenderer
          key={child.id}
          component={child}
          isPreview={true}
        />
      ))}
      
      {/* Submit button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
        
        {props.showResetButton && (
          <button
            type="button"
            onClick={() => setFormData({})}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        )}
      </div>
      
      {/* Submit message */}
      {submitMessage && (
        <div className={`p-3 rounded-md text-sm ${
          submitMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {submitMessage.text}
        </div>
      )}
      
      {/* Form data preview (development) */}
      {process.env.NODE_ENV === 'development' && Object.keys(formData).length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer">Form Data (dev)</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      )}
    </form>
  );
};