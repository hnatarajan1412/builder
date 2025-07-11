import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PreviewMode } from '../src/components/PreviewMode';
import { useBuilderStore } from '../src/stores/builder.store';
import { databaseService } from '../src/services/database-compat.service';

// Mock the stores and services
jest.mock('../src/stores/builder.store');
jest.mock('../src/stores/user.store');
jest.mock('../src/services/database-compat.service');

describe('PreviewMode Data Binding', () => {
  const mockApp = {
    id: 'app-1',
    name: 'Test App',
    description: 'Test',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockTable = {
    id: 'table-1',
    appId: 'app-1',
    name: 'products',
    fields: [
      { name: 'id', type: 'string' as const, required: true },
      { name: 'name', type: 'string' as const, required: true },
      { name: 'price', type: 'number' as const, required: true },
      { name: 'description', type: 'string' as const, required: false }
    ]
  };

  const mockData = [
    { id: '1', name: 'Product 1', price: 29.99, description: 'First product' },
    { id: '2', name: 'Product 2', price: 39.99, description: 'Second product' },
    { id: '3', name: 'Product 3', price: 49.99, description: 'Third product' }
  ];

  const mockPage = {
    id: 'page-1',
    appId: 'app-1',
    name: 'Test Page',
    path: '/test',
    components: [
      {
        id: 'repeater-1',
        componentId: 'repeater',
        props: {
          spacing: 2,
          maxItems: 10
        },
        bindings: {
          dataSource: {
            type: 'field',
            tableId: 'table-1',
            fieldName: '',
            mode: 'list'
          }
        },
        style: {},
        children: [
          {
            id: 'text-1',
            componentId: 'text',
            props: {
              type: 'heading3'
            },
            bindings: {
              text: {
                type: 'field',
                tableId: 'table-1',
                fieldName: 'name',
                mode: 'single'
              }
            },
            style: {}
          },
          {
            id: 'text-2',
            componentId: 'text',
            props: {
              type: 'paragraph'
            },
            bindings: {
              text: {
                type: 'field',
                tableId: 'table-1',
                fieldName: 'description',
                mode: 'single'
              }
            },
            style: {}
          },
          {
            id: 'text-3',
            componentId: 'text',
            props: {
              type: 'caption'
            },
            bindings: {
              text: {
                type: 'field',
                tableId: 'table-1',
                fieldName: 'price',
                mode: 'single'
              }
            },
            style: {}
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock store implementation
    (useBuilderStore as unknown as jest.Mock).mockReturnValue({
      currentPage: mockPage,
      currentApp: mockApp,
      tables: { 'table-1': mockTable }
    });

    // Mock database service
    (databaseService.getAllData as jest.Mock).mockReturnValue(mockData);
  });

  test('renders repeater with database data', async () => {
    render(<PreviewMode isOpen={true} onClose={() => {}} />);

    // Wait for the component to render with data
    await waitFor(() => {
      // Check if all products are rendered
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 3')).toBeInTheDocument();
    });

    // Check descriptions
    expect(screen.getByText('First product')).toBeInTheDocument();
    expect(screen.getByText('Second product')).toBeInTheDocument();
    expect(screen.getByText('Third product')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('29.99')).toBeInTheDocument();
    expect(screen.getByText('39.99')).toBeInTheDocument();
    expect(screen.getByText('49.99')).toBeInTheDocument();
  });

  test('handles empty data gracefully', async () => {
    (databaseService.getAllData as jest.Mock).mockReturnValue([]);

    render(<PreviewMode isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });

  test('respects maxItems property', async () => {
    const longMockData = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: 10 + i,
      description: `Description ${i + 1}`
    }));

    (databaseService.getAllData as jest.Mock).mockReturnValue(longMockData);

    // Update page with maxItems = 5
    const limitedPage = {
      ...mockPage,
      components: [{
        ...mockPage.components[0],
        props: { ...mockPage.components[0].props, maxItems: 5 }
      }]
    };

    (useBuilderStore as unknown as jest.Mock).mockReturnValue({
      currentPage: limitedPage,
      currentApp: mockApp,
      tables: { 'table-1': mockTable }
    });

    render(<PreviewMode isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      // Should only render first 5 items
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 5')).toBeInTheDocument();
      
      // Should not render beyond maxItems
      expect(screen.queryByText('Product 6')).not.toBeInTheDocument();
    });
  });

  test('updates when data binding changes', async () => {
    const { rerender } = render(<PreviewMode isOpen={true} onClose={() => {}} />);

    // Initial render
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Update the data
    const updatedData = [
      { id: '1', name: 'Updated Product 1', price: 99.99, description: 'Updated description' }
    ];
    (databaseService.getAllData as jest.Mock).mockReturnValue(updatedData);

    // Force re-render
    rerender(<PreviewMode isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Updated Product 1')).toBeInTheDocument();
      expect(screen.getByText('Updated description')).toBeInTheDocument();
      expect(screen.getByText('99.99')).toBeInTheDocument();
    });
  });
});