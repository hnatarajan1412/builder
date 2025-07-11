import React from 'react';
import { useDrop } from 'react-dnd';
import { useBuilderStore } from '../stores/builder.store';
import { ComponentRenderer } from './ComponentRenderer';
import { EmptyCanvas } from './EmptyCanvas';
import { Breadcrumb } from './Breadcrumb';
import { ViewportControls, ViewportWrapper } from './ViewportControls';
import { v4 as uuidv4 } from 'uuid';
import { ComponentInstance, ComponentType } from '../types';

export const Canvas: React.FC = () => {
  const { currentPage, addComponentToPage, selectComponent } = useBuilderStore();

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: any, monitor) => {
      console.log('Drop event triggered', item);
      if (monitor.didDrop()) return;
      
      if (item.isNew) {
        // Create new component instance
        const newComponent: ComponentInstance = {
          id: uuidv4(),
          componentId: item.type,
          props: getDefaultProps(item.type),
          style: getDefaultStyle(item.type),
        };
        
        console.log('Adding component:', newComponent);
        addComponentToPage(newComponent);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getDefaultProps = (type: ComponentType): Record<string, any> => {
    switch (type) {
      case 'text':
        return { text: 'Text content' };
      case 'button':
        return { label: 'Button' };
      case 'input':
        return { placeholder: 'Enter text...' };
      case 'image':
        return { src: 'https://via.placeholder.com/300x200', alt: 'Image' };
      case 'table':
        return { 
          columns: [], // No default columns - start with empty
          data: '', // Magic text binding
          striped: true,
          hover: true
        };
      case 'list':
        return {
          items: ['Item 1', 'Item 2', 'Item 3'],
          ordered: false
        };
      case 'repeater':
        return {
          dataSource: '', // Empty string for magic text
          direction: 'vertical',
          spacing: 8
        };
      default:
        return {};
    }
  };

  const getDefaultStyle = (type: ComponentType): Record<string, any> => {
    switch (type) {
      case 'container':
        return { 
          padding: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          minHeight: '120px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(229, 231, 235, 0.5)'
        };
      case 'button':
        return {
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        };
      default:
        return {};
    }
  };

  if (!currentPage) {
    return <EmptyCanvas />;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <Breadcrumb />
      <ViewportControls />
      
      <div className="flex-1 overflow-auto">
        <ViewportWrapper>
          <div
            ref={drop as any}
            data-testid="canvas-drop-zone"
            className={`
              min-h-full bg-white border-2
              ${isOver && canDrop ? 'border-blue-400 bg-blue-50/20' : 'border-gray-200'}
              ${currentPage.components.length === 0 ? 'flex items-center justify-center h-full' : 'p-6'}
              transition-all duration-200
            `}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                selectComponent(null);
              }
            }}
          >
            {currentPage.components.length === 0 ? (
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">Drop components here to start building</p>
                <p className="text-gray-400 text-sm mt-1">Or double-click to add a container</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPage.components.map((component) => (
                  <ComponentRenderer key={component.id} component={component} />
                ))}
              </div>
            )}
          </div>
        </ViewportWrapper>
      </div>
    </div>
  );
};