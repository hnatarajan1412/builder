import { App, Page, Table, ComponentInstance } from '../src/types';
import { databaseService } from '../src/services/database-compat.service';

// Helper to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create database schema
function createDatabaseSchema(appId: string): Table[] {
  const tables: Table[] = [
    {
      id: generateId(),
      appId,
      name: 'products',
      fields: [
        { name: 'id', type: 'text', primaryKey: true, required: true },
        { name: 'name', type: 'text', primaryKey: false, required: true },
        { name: 'description', type: 'text', primaryKey: false, required: false },
        { name: 'price', type: 'number', primaryKey: false, required: true },
        { name: 'inventory', type: 'number', primaryKey: false, required: true },
        { name: 'category', type: 'text', primaryKey: false, required: false },
        { name: 'image_url', type: 'text', primaryKey: false, required: false },
        { name: 'sku', type: 'text', primaryKey: false, required: true },
        { name: 'is_active', type: 'boolean', primaryKey: false, required: false }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'orders',
      fields: [
        { name: 'id', type: 'text', primaryKey: true, required: true },
        { name: 'order_number', type: 'text', primaryKey: false, required: true },
        { name: 'customer_name', type: 'text', primaryKey: false, required: true },
        { name: 'customer_email', type: 'text', primaryKey: false, required: true },
        { name: 'total_amount', type: 'number', primaryKey: false, required: true },
        { name: 'status', type: 'text', primaryKey: false, required: true },
        { name: 'created_at', type: 'datetime', primaryKey: false, required: true }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'order_items',
      fields: [
        { name: 'id', type: 'text', primaryKey: true, required: true },
        { name: 'order_id', type: 'text', primaryKey: false, required: true },
        { name: 'product_id', type: 'text', primaryKey: false, required: true },
        { name: 'quantity', type: 'number', primaryKey: false, required: true },
        { name: 'price', type: 'number', primaryKey: false, required: true }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'customers',
      fields: [
        { name: 'id', type: 'text', primaryKey: true, required: true },
        { name: 'name', type: 'text', primaryKey: false, required: true },
        { name: 'email', type: 'text', primaryKey: false, required: true },
        { name: 'phone', type: 'text', primaryKey: false, required: false },
        { name: 'address', type: 'text', primaryKey: false, required: false }
      ]
    }
  ];

  // Initialize tables in database service
  tables.forEach(table => {
    databaseService.createTable(appId, table.name, table.fields);
  });

  return tables;
}

// Create Admin Panel App
function createAdminPanelApp(): { app: App; pages: Page[]; tables: Table[] } {
  const appId = generateId();
  
  const app: App = {
    id: appId,
    name: 'Admin Panel',
    description: 'Product and inventory management system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Create database schema (shared across apps)
  const tables = createDatabaseSchema(appId);

  // Create pages
  const pages: Page[] = [
    {
      id: generateId(),
      appId,
      name: 'Dashboard',
      path: '/',
      components: [
        // Title
        {
          id: generateId(),
          componentId: 'text',
          props: { text: 'Admin Dashboard', type: 'heading1' },
          style: { marginBottom: '24px' },
          children: []
        },
        // Stats container
        {
          id: generateId(),
          componentId: 'container',
          props: { layout: 'horizontal', gap: 16 },
          style: { marginBottom: '32px' },
          children: [
            // Total Products card
            {
              id: generateId(),
              componentId: 'container',
              props: {},
              style: { 
                padding: '20px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px',
                flex: 1
              },
              children: [
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: 'Total Products', type: 'caption' },
                  style: { color: '#6b7280', marginBottom: '8px' },
                  children: []
                },
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: '{{products.count()}}', type: 'heading2' },
                  bindings: {
                    text: {
                      type: 'dynamic',
                      expression: '{{products.count()}}'
                    }
                  },
                  style: { color: '#1f2937' },
                  children: []
                }
              ]
            },
            // Total Orders card
            {
              id: generateId(),
              componentId: 'container',
              props: {},
              style: { 
                padding: '20px', 
                backgroundColor: '#dbeafe', 
                borderRadius: '8px',
                flex: 1
              },
              children: [
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: 'Total Orders', type: 'caption' },
                  style: { color: '#1e40af', marginBottom: '8px' },
                  children: []
                },
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: '{{orders.count()}}', type: 'heading2' },
                  bindings: {
                    text: {
                      type: 'dynamic',
                      expression: '{{orders.count()}}'
                    }
                  },
                  style: { color: '#1e40af' },
                  children: []
                }
              ]
            },
            // Revenue card
            {
              id: generateId(),
              componentId: 'container',
              props: {},
              style: { 
                padding: '20px', 
                backgroundColor: '#d1fae5', 
                borderRadius: '8px',
                flex: 1
              },
              children: [
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: 'Total Revenue', type: 'caption' },
                  style: { color: '#065f46', marginBottom: '8px' },
                  children: []
                },
                {
                  id: generateId(),
                  componentId: 'text',
                  props: { text: '${{orders.sum(total_amount)|currency:USD}}', type: 'heading2' },
                  bindings: {
                    text: {
                      type: 'dynamic',
                      expression: '{{orders.sum(total_amount)|currency:USD}}'
                    }
                  },
                  style: { color: '#065f46' },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'Products',
      path: '/products',
      components: [
        // Page title
        {
          id: generateId(),
          componentId: 'text',
          props: { text: 'Product Management', type: 'heading1' },
          style: { marginBottom: '24px' },
          children: []
        },
        // Add product button
        {
          id: generateId(),
          componentId: 'button',
          props: { label: 'Add New Product', variant: 'primary' },
          style: { marginBottom: '24px' },
          events: [
            {
              event: 'onClick',
              action: 'showModal',
              parameters: { modalId: 'add-product-modal' }
            }
          ],
          children: []
        },
        // Products table
        {
          id: generateId(),
          componentId: 'table',
          props: {
            columns: [
              { field: 'name', label: 'Product Name' },
              { field: 'sku', label: 'SKU' },
              { field: 'price', label: 'Price' },
              { field: 'inventory', label: 'Stock' },
              { field: 'category', label: 'Category' },
              { field: 'is_active', label: 'Active' }
            ],
            striped: true,
            hover: true
          },
          bindings: {
            data: {
              type: 'dynamic',
              expression: '{{products}}'
            }
          },
          style: {},
          children: []
        }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'Orders',
      path: '/orders',
      components: [
        // Page title
        {
          id: generateId(),
          componentId: 'text',
          props: { text: 'Order Management', type: 'heading1' },
          style: { marginBottom: '24px' },
          children: []
        },
        // Orders table
        {
          id: generateId(),
          componentId: 'table',
          props: {
            columns: [
              { field: 'order_number', label: 'Order #' },
              { field: 'customer_name', label: 'Customer' },
              { field: 'total_amount', label: 'Total' },
              { field: 'status', label: 'Status' },
              { field: 'created_at', label: 'Date' }
            ],
            striped: true,
            hover: true
          },
          bindings: {
            data: {
              type: 'dynamic',
              expression: '{{orders}}'
            }
          },
          style: {},
          children: []
        }
      ]
    }
  ];

  // Add sample data
  const sampleProducts = [
    {
      id: 'prod-1',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      inventory: 50,
      category: 'Electronics',
      image_url: 'https://via.placeholder.com/300x300',
      sku: 'WH-001',
      is_active: true
    },
    {
      id: 'prod-2',
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor',
      price: 299.99,
      inventory: 30,
      category: 'Electronics',
      image_url: 'https://via.placeholder.com/300x300',
      sku: 'SW-001',
      is_active: true
    },
    {
      id: 'prod-3',
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand',
      price: 49.99,
      inventory: 100,
      category: 'Accessories',
      image_url: 'https://via.placeholder.com/300x300',
      sku: 'LS-001',
      is_active: true
    }
  ];

  sampleProducts.forEach(product => {
    databaseService.insert(appId, 'products', product);
  });

  return { app, pages, tables };
}

// Create Online Store App
function createOnlineStoreApp(tables: Table[]): { app: App; pages: Page[] } {
  const appId = generateId();
  
  const app: App = {
    id: appId,
    name: 'Online Store',
    description: 'Customer shopping experience',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const pages: Page[] = [
    {
      id: generateId(),
      appId,
      name: 'Home',
      path: '/',
      components: [
        // Hero section
        {
          id: generateId(),
          componentId: 'container',
          props: {},
          style: { 
            backgroundColor: '#1f2937', 
            padding: '48px 24px',
            marginBottom: '32px'
          },
          children: [
            {
              id: generateId(),
              componentId: 'text',
              props: { text: 'Welcome to Our Store', type: 'heading1' },
              style: { 
                color: 'white', 
                textAlign: 'center',
                marginBottom: '16px'
              },
              children: []
            },
            {
              id: generateId(),
              componentId: 'text',
              props: { text: 'Discover amazing products at great prices', type: 'paragraph' },
              style: { 
                color: '#d1d5db', 
                textAlign: 'center',
                fontSize: '18px'
              },
              children: []
            }
          ]
        },
        // Products grid
        {
          id: generateId(),
          componentId: 'container',
          props: {},
          style: { padding: '0 24px' },
          children: [
            {
              id: generateId(),
              componentId: 'text',
              props: { text: 'Featured Products', type: 'heading2' },
              style: { marginBottom: '24px' },
              children: []
            },
            {
              id: generateId(),
              componentId: 'container',
              props: { layout: 'grid', gap: 24 },
              style: { 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              },
              children: [
                // Product card template (would be repeated for each product)
                {
                  id: generateId(),
                  componentId: 'container',
                  props: {},
                  style: { 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px'
                  },
                  bindings: {
                    repeat: {
                      type: 'dynamic',
                      expression: '{{products}}'
                    }
                  },
                  children: [
                    {
                      id: generateId(),
                      componentId: 'image',
                      props: { 
                        src: '{{item.image_url}}',
                        alt: '{{item.name}}'
                      },
                      bindings: {
                        src: {
                          type: 'dynamic',
                          expression: '{{item.image_url}}'
                        },
                        alt: {
                          type: 'dynamic',
                          expression: '{{item.name}}'
                        }
                      },
                      style: { 
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginBottom: '12px'
                      },
                      children: []
                    },
                    {
                      id: generateId(),
                      componentId: 'text',
                      props: { text: '{{item.name}}', type: 'heading3' },
                      bindings: {
                        text: {
                          type: 'dynamic',
                          expression: '{{item.name}}'
                        }
                      },
                      style: { marginBottom: '8px' },
                      children: []
                    },
                    {
                      id: generateId(),
                      componentId: 'text',
                      props: { text: '{{item.description}}', type: 'paragraph' },
                      bindings: {
                        text: {
                          type: 'dynamic',
                          expression: '{{item.description}}'
                        }
                      },
                      style: { 
                        color: '#6b7280',
                        marginBottom: '12px',
                        fontSize: '14px'
                      },
                      children: []
                    },
                    {
                      id: generateId(),
                      componentId: 'text',
                      props: { text: '${{item.price|currency:USD}}', type: 'heading3' },
                      bindings: {
                        text: {
                          type: 'dynamic',
                          expression: '{{item.price|currency:USD}}'
                        }
                      },
                      style: { 
                        color: '#1f2937',
                        marginBottom: '12px'
                      },
                      children: []
                    },
                    {
                      id: generateId(),
                      componentId: 'button',
                      props: { label: 'Add to Cart', variant: 'primary', size: 'medium' },
                      style: { width: '100%' },
                      events: [
                        {
                          event: 'onClick',
                          action: 'addToCart',
                          parameters: { productId: '{{item.id}}' }
                        }
                      ],
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: generateId(),
      appId,
      name: 'Cart',
      path: '/cart',
      components: [
        {
          id: generateId(),
          componentId: 'text',
          props: { text: 'Shopping Cart', type: 'heading1' },
          style: { marginBottom: '24px' },
          children: []
        },
        {
          id: generateId(),
          componentId: 'container',
          props: {},
          style: { 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
          },
          children: [
            {
              id: generateId(),
              componentId: 'text',
              props: { text: 'Your cart is empty', type: 'paragraph' },
              style: { textAlign: 'center', color: '#6b7280' },
              children: []
            }
          ]
        }
      ]
    }
  ];

  return { app, pages };
}

// Export the demo data
export const createOnlineStoreDemo = () => {
  // Create Admin Panel
  const adminPanel = createAdminPanelApp();
  
  // Create Online Store (using same tables)
  const onlineStore = createOnlineStoreApp(adminPanel.tables);
  
  return {
    apps: [adminPanel.app, onlineStore.app],
    pages: [...adminPanel.pages, ...onlineStore.pages],
    tables: adminPanel.tables,
    summary: {
      totalApps: 2,
      totalPages: adminPanel.pages.length + onlineStore.pages.length,
      totalTables: adminPanel.tables.length,
      sharedDatabase: true
    }
  };
};

// Log the demo structure
const demo = createOnlineStoreDemo();
console.log('Online Store Demo Created:', demo.summary);
console.log('Apps:', demo.apps.map(a => a.name));
console.log('Pages:', demo.pages.map(p => `${p.name} (${p.path})`));
console.log('Tables:', demo.tables.map(t => `${t.name} (${t.fields.length} fields)`));