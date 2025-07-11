import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentRenderer } from '../components/ComponentRenderer';
import { PreviewMode } from '../components/PreviewMode';
import { useBuilderStore } from '../stores/builder.store';
import { databaseService } from '../services/database-compat.service';
import { ComponentInstance } from '../types';

// Mock the stores and services
jest.mock('../stores/builder.store');
jest.mock('../services/database.service');

const mockBuilderStore = useBuilderStore as jest.MockedFunction<typeof useBuilderStore>;

describe('Table and Repeater Components with Magic Text', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    const testApp = { id: 'test-app', name: 'Test App' };
    
    // Mock database tables
    databaseService.query = jest.fn((appId, tableName) => {
      if (tableName === 'products') {
        return {
          rows: [
            { id: 1, name: 'iPhone 14', price: 999, category: 'Electronics', imageUrl: '/iphone.jpg' },
            { id: 2, name: 'MacBook Pro', price: 2499, category: 'Computers', imageUrl: '/macbook.jpg' },
            { id: 3, name: 'AirPods', price: 249, category: 'Accessories', imageUrl: '/airpods.jpg' }
          ]
        };
      }
      if (tableName === 'users') {
        return {
          rows: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
          ]
        };
      }
      return { rows: [] };
    });
    
    // Mock builder store
    mockBuilderStore.mockReturnValue({
      currentApp: testApp,
      currentPage: { id: 'page-1', name: 'Test Page', components: [] },
      selectComponent: jest.fn(),
      updateComponent: jest.fn(),
      removeComponent: jest.fn(),
      duplicateComponent: jest.fn(),
      updateComponentProps: jest.fn(),
      addComponentToPage: jest.fn(),
      pages: {},
      pageState: {},
      updatePageState: jest.fn(),
    });
  });

  describe('Table Component Tests', () => {
    test('renders table with magic text data source', async () => {
      const tableComponent: ComponentInstance = {
        id: 'table-1',
        componentId: 'table',
        props: {
          data: '{{products}}',
          columns: [
            { field: 'name', label: 'Product' },
            { field: 'price', label: 'Price', format: 'currency' },
            { field: 'category', label: 'Category' }
          ],
          striped: true,
          hover: true
        }
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={tableComponent} isPreview={true} />
        </DndProvider>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument();
        expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
        expect(screen.getByText('AirPods')).toBeInTheDocument();
      });

      // Check currency formatting
      expect(screen.getByText('$999.00')).toBeInTheDocument();
      expect(screen.getByText('$2,499.00')).toBeInTheDocument();
    });

    test('handles empty data source gracefully', () => {
      const tableComponent: ComponentInstance = {
        id: 'table-2',
        componentId: 'table',
        props: {
          data: '',
          columns: [{ field: 'name', label: 'Name' }]
        }
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={tableComponent} isPreview={true} />
        </DndProvider>
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Repeater Component Tests', () => {
    test('repeater with text components showing product data', async () => {
      const repeaterComponent: ComponentInstance = {
        id: 'repeater-1',
        componentId: 'repeater',
        props: {
          dataSource: '{{products}}',
          direction: 'vertical',
          spacing: 8
        },
        children: [
          {
            id: 'text-1',
            componentId: 'text',
            props: {
              text: '{{item.name}} - {{item.price|currency}}'
            }
          }
        ]
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={repeaterComponent} isPreview={true} />
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('iPhone 14 - $999.00')).toBeInTheDocument();
        expect(screen.getByText('MacBook Pro - $2,499.00')).toBeInTheDocument();
        expect(screen.getByText('AirPods - $249.00')).toBeInTheDocument();
      });
    });

    test('repeater with button components and event handlers', async () => {
      const mockUpdatePageState = jest.fn();
      mockBuilderStore.mockReturnValue({
        ...mockBuilderStore(),
        updatePageState: mockUpdatePageState
      });

      const repeaterComponent: ComponentInstance = {
        id: 'repeater-2',
        componentId: 'repeater',
        props: {
          dataSource: '{{products}}',
          direction: 'horizontal'
        },
        children: [
          {
            id: 'button-1',
            componentId: 'button',
            props: {
              label: 'Buy {{item.name}}',
              variant: 'primary'
            },
            events: [{
              trigger: 'click',
              action: {
                type: 'updateState',
                parameters: {
                  key: 'selectedProduct',
                  value: '{{item}}'
                }
              }
            }]
          }
        ]
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <PreviewMode>
            <ComponentRenderer component={repeaterComponent} isPreview={true} />
          </PreviewMode>
        </DndProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Buy iPhone 14')).toBeInTheDocument();
      });

      // Click the first button
      fireEvent.click(screen.getByText('Buy iPhone 14'));

      expect(mockUpdatePageState).toHaveBeenCalledWith('selectedProduct', {
        id: 1,
        name: 'iPhone 14',
        price: 999,
        category: 'Electronics',
        imageUrl: '/iphone.jpg'
      });
    });

    test('repeater with image components and dynamic URLs', async () => {
      const repeaterComponent: ComponentInstance = {
        id: 'repeater-3',
        componentId: 'repeater',
        props: {
          dataSource: '{{products}}',
          direction: 'grid',
          gridColumns: 3
        },
        children: [
          {
            id: 'container-1',
            componentId: 'container',
            props: { layout: 'vertical', gap: 8 },
            children: [
              {
                id: 'image-1',
                componentId: 'image',
                props: {
                  src: '{{item.imageUrl}}',
                  alt: '{{item.name}}'
                }
              },
              {
                id: 'text-1',
                componentId: 'text',
                props: {
                  text: '{{item.name}}',
                  type: 'heading3'
                }
              }
            ]
          }
        ]
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={repeaterComponent} isPreview={true} />
        </DndProvider>
      );

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
        expect(images[0]).toHaveAttribute('src', '/iphone.jpg');
        expect(images[0]).toHaveAttribute('alt', 'iPhone 14');
      });
    });

    test('repeater with form inputs collecting data', async () => {
      const repeaterComponent: ComponentInstance = {
        id: 'repeater-4',
        componentId: 'repeater',
        props: {
          dataSource: '{{users}}',
          direction: 'vertical'
        },
        children: [
          {
            id: 'container-1',
            componentId: 'container',
            props: { layout: 'horizontal', gap: 16 },
            children: [
              {
                id: 'text-1',
                componentId: 'text',
                props: { text: '{{item.name}}' }
              },
              {
                id: 'input-1',
                componentId: 'input',
                props: {
                  placeholder: 'Update email for {{item.name}}',
                  defaultValue: '{{item.email}}',
                  type: 'email'
                }
              }
            ]
          }
        ]
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={repeaterComponent} isPreview={true} />
        </DndProvider>
      );

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(2);
        expect(inputs[0]).toHaveValue('john@example.com');
        expect(inputs[0]).toHaveAttribute('placeholder', 'Update email for John Doe');
      });
    });

    test('nested repeater with mixed components', async () => {
      // Mock nested data
      databaseService.query = jest.fn((appId, tableName) => {
        if (tableName === 'categories') {
          return {
            rows: [
              { id: 1, name: 'Electronics', products: [
                { id: 1, name: 'iPhone', price: 999 },
                { id: 2, name: 'iPad', price: 799 }
              ]},
              { id: 2, name: 'Accessories', products: [
                { id: 3, name: 'Case', price: 49 },
                { id: 4, name: 'Charger', price: 29 }
              ]}
            ]
          };
        }
        return { rows: [] };
      });

      const repeaterComponent: ComponentInstance = {
        id: 'repeater-parent',
        componentId: 'repeater',
        props: {
          dataSource: '{{categories}}',
          direction: 'vertical'
        },
        children: [
          {
            id: 'container-1',
            componentId: 'container',
            props: { layout: 'vertical' },
            children: [
              {
                id: 'text-category',
                componentId: 'text',
                props: { 
                  text: '{{item.name}}',
                  type: 'heading2'
                }
              },
              {
                id: 'repeater-child',
                componentId: 'repeater',
                props: {
                  dataSource: '{{item.products}}',
                  direction: 'horizontal'
                },
                children: [
                  {
                    id: 'text-product',
                    componentId: 'text',
                    props: {
                      text: '{{item.name}} - {{item.price|currency}}'
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      render(
        <DndProvider backend={HTML5Backend}>
          <ComponentRenderer component={repeaterComponent} isPreview={true} />
        </DndProvider>
      );

      await waitFor(() => {
        // Check category headers
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Accessories')).toBeInTheDocument();
        
        // Check products
        expect(screen.getByText('iPhone - $999.00')).toBeInTheDocument();
        expect(screen.getByText('Case - $49.00')).toBeInTheDocument();
      });
    });
  });

  describe('Preview Mode Integration Tests', () => {
    test('full page with table and repeater components', async () => {
      const pageComponents: ComponentInstance[] = [
        {
          id: 'heading-1',
          componentId: 'text',
          props: {
            text: 'Product Catalog',
            type: 'heading1'
          }
        },
        {
          id: 'table-1',
          componentId: 'table',
          props: {
            data: '{{products}}',
            columns: [
              { field: 'name', label: 'Product' },
              { field: 'price', label: 'Price', format: 'currency' }
            ]
          }
        },
        {
          id: 'repeater-1',
          componentId: 'repeater',
          props: {
            dataSource: '{{products}}',
            direction: 'grid',
            gridColumns: 3
          },
          children: [
            {
              id: 'card-1',
              componentId: 'container',
              style: {
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px'
              },
              children: [
                {
                  id: 'product-name',
                  componentId: 'text',
                  props: {
                    text: '{{item.name}}',
                    type: 'heading3'
                  }
                },
                {
                  id: 'product-price',
                  componentId: 'text',
                  props: {
                    text: 'Price: {{item.price|currency}}'
                  }
                },
                {
                  id: 'buy-button',
                  componentId: 'button',
                  props: {
                    label: 'Add to Cart',
                    variant: 'primary'
                  },
                  events: [{
                    trigger: 'click',
                    action: {
                      type: 'alert',
                      parameters: {
                        message: 'Added {{item.name}} to cart!'
                      }
                    }
                  }]
                }
              ]
            }
          ]
        }
      ];

      mockBuilderStore.mockReturnValue({
        ...mockBuilderStore(),
        currentPage: {
          id: 'page-1',
          name: 'Products',
          components: pageComponents
        }
      });

      render(
        <DndProvider backend={HTML5Backend}>
          <PreviewMode />
        </DndProvider>
      );

      await waitFor(() => {
        // Check heading
        expect(screen.getByText('Product Catalog')).toBeInTheDocument();
        
        // Check table has data
        const tables = screen.getAllByRole('table');
        expect(tables).toHaveLength(1);
        
        // Check repeater cards
        expect(screen.getAllByText('Add to Cart')).toHaveLength(3);
        
        // Check formatted prices
        expect(screen.getAllByText(/\$[\d,]+\.\d{2}/)).toHaveLength(6); // 3 in table + 3 in cards
      });

      // Test button click
      window.alert = jest.fn();
      fireEvent.click(screen.getAllByText('Add to Cart')[0]);
      expect(window.alert).toHaveBeenCalledWith('Added iPhone 14 to cart!');
    });
  });
});