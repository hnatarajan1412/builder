import React, { useState } from 'react';
import { Search, Star, Download, User, Package, Sparkles, Zap } from 'lucide-react';
import { ComponentType } from '../types';
import { useDrag } from 'react-dnd';
import * as Dialog from '@radix-ui/react-dialog';

interface MarketplaceComponent {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  thumbnail: string;
  componentType: ComponentType;
  isOfficial: boolean;
  isPremium: boolean;
  version: string;
  lastUpdated: string;
}

interface DraggableMarketplaceComponentProps {
  component: MarketplaceComponent;
}

const DraggableMarketplaceComponent: React.FC<DraggableMarketplaceComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { 
      type: component.componentType, 
      isNew: true,
      marketplace: true,
      marketplaceId: component.id
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`group relative bg-white border rounded-lg p-4 hover:shadow-lg transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {component.isPremium && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Pro
        </div>
      )}
      
      {component.isOfficial && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Official
        </div>
      )}
      
      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        {component.thumbnail ? (
          <img src={component.thumbnail} alt={component.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <Package className="w-8 h-8 text-gray-400" />
        )}
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{component.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{component.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {component.author}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {component.rating}
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {component.downloads}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {component.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>v{component.version}</span>
          <span>{component.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

interface ComponentMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComponentMarketplace: React.FC<ComponentMarketplaceProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const marketplaceComponents: MarketplaceComponent[] = [
    {
      id: 'advanced-form',
      name: 'Advanced Form Builder',
      description: 'Professional form component with validation, conditional logic, and multi-step support',
      author: 'NoCode Team',
      category: 'forms',
      tags: ['form', 'validation', 'multi-step'],
      rating: 4.8,
      downloads: 2450,
      thumbnail: '',
      componentType: 'form',
      isOfficial: true,
      isPremium: true,
      version: '2.1.0',
      lastUpdated: '2 days ago'
    },
    {
      id: 'data-table-pro',
      name: 'Data Table Pro',
      description: 'Advanced data table with sorting, filtering, pagination, and export capabilities',
      author: 'TableCorp',
      category: 'data',
      tags: ['table', 'data', 'export', 'pagination'],
      rating: 4.6,
      downloads: 1850,
      thumbnail: '',
      componentType: 'table',
      isOfficial: false,
      isPremium: true,
      version: '3.0.2',
      lastUpdated: '1 week ago'
    }
  ];

  const filteredComponents = marketplaceComponents.filter(comp => {
    return comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           comp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div>
              <Dialog.Title className="text-xl font-bold">
                Component Marketplace
              </Dialog.Title>
              <p className="text-blue-100 text-sm mt-1">
                Discover and install professional components
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-white/20 rounded-md transition-colors">
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 border-b bg-white">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComponents.map(component => (
                <DraggableMarketplaceComponent
                  key={component.id}
                  component={component}
                />
              ))}
            </div>
            
            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
                <p className="text-gray-500">Try adjusting your search</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Tip: Drag components directly to your canvas
            </div>
            <div className="text-xs text-gray-500">
              {filteredComponents.length} components available
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};