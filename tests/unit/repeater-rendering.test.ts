import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RepeaterComponent } from '../../src/components/RepeaterComponent';
import { useBuilderStore } from '../../src/stores/builder.store';
import { databaseService } from '../../src/services/database-compat.service';

// Mock the stores and services
jest.mock('../../src/stores/builder.store');
jest.mock('../../src/services/database.service');

const mockUseBuilderStore = useBuilderStore as jest.MockedFunction<typeof useBuilderStore>;

describe('RepeaterComponent Rendering', () => {
  const appId = 'test-app';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock store
    mockUseBuilderStore.mockReturnValue({
      currentApp: { id: appId, name: 'Test App' },
      addComponentToPage: jest.fn(),
    } as any);
    
    // Initialize database
    databaseService.initializeApp(appId);
    databaseService.addTable(appId, 'products', [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'number' }
    ]);
    
    // Add test data
    databaseService.addRecord(appId, 'products', { name: 'Product 1', price: 100 });
    databaseService.addRecord(appId, 'products', { name: 'Product 2', price: 200 });
  });

  test('renders empty state when no data source', () => {
    const component = {
      id: 'repeater-1',
      componentId: 'repeater',
      props: {
        dataSource: '',
        maxItems: 100,
        spacing: 8
      }
    };
    
    render(
      <DndProvider backend={HTML5Backend}>
        <RepeaterComponent component={component} />
      </DndProvider>
    );
    
    expect(screen.getByText('Drop components here to design the template')).toBeInTheDocument();
    expect(screen.getByText('Preview (0 items):')).toBeInTheDocument();
  });

  test('renders with data source and template', () => {
    const component = {
      id: 'repeater-1',
      componentId: 'repeater',
      props: {
        dataSource: '{{products}}',
        maxItems: 100,
        spacing: 8
      },
      children: [{
        id: 'text-1',
        componentId: 'text',
        props: {
          text: '{{item.name}}'
        }
      }]
    };
    
    // Mock query to return products
    (databaseService.query as jest.Mock).mockReturnValue({
      rows: [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 }
      ]
    });
    
    render(
      <DndProvider backend={HTML5Backend}>
        <RepeaterComponent component={component} />
      </DndProvider>
    );
    
    expect(screen.getByText('Template (edit here):')).toBeInTheDocument();
    expect(screen.getByText('Preview (2 items):')).toBeInTheDocument();
  });

  test('handles legacy data source format', () => {
    const component = {
      id: 'repeater-1',
      componentId: 'repeater',
      props: {
        dataSource: {
          type: 'table',
          tableName: 'products',
          appId: appId
        },
        maxItems: 100
      }
    };
    
    // Mock query to return products
    (databaseService.query as jest.Mock).mockReturnValue({
      rows: [
        { id: '1', name: 'Product 1', price: 100 }
      ]
    });
    
    render(
      <DndProvider backend={HTML5Backend}>
        <RepeaterComponent component={component} />
      </DndProvider>
    );
    
    expect(screen.getByText('Preview (1 items):')).toBeInTheDocument();
  });
});