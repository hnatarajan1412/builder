import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Database, Globe, User, Clock, FileText, Search } from 'lucide-react';
import { DataSourceTree, DataSourceNode, PropertyType } from '../../types/binding.types';
import * as Accordion from '@radix-ui/react-accordion';

interface DataSourceExplorerProps {
  dataSources: DataSourceTree;
  onSelect: (path: string[]) => void;
  selectedPath?: string | null;
  propertyType?: PropertyType;
}

const categoryIcons = {
  appState: Globe,
  database: Database,
  user: User,
  pageContext: FileText,
  system: Clock,
  apiResponse: Globe
};

const categoryLabels = {
  appState: 'App State',
  database: 'Database',
  user: 'User',
  pageContext: 'Page Context',
  system: 'System',
  apiResponse: 'API Response'
};

export const DataSourceExplorer: React.FC<DataSourceExplorerProps> = ({
  dataSources,
  onSelect,
  selectedPath,
  propertyType
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['database', 'user']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filterNodes = (nodes: DataSourceNode[], query: string): DataSourceNode[] => {
    if (!query) return nodes;
    
    return nodes.reduce((filtered: DataSourceNode[], node) => {
      const matchesQuery = node.label.toLowerCase().includes(query.toLowerCase()) ||
                          node.id.toLowerCase().includes(query.toLowerCase()) ||
                          node.description?.toLowerCase().includes(query.toLowerCase());
      
      if (node.children) {
        const filteredChildren = filterNodes(node.children, query);
        if (filteredChildren.length > 0) {
          filtered.push({ ...node, children: filteredChildren });
        } else if (matchesQuery) {
          filtered.push(node);
        }
      } else if (matchesQuery) {
        filtered.push(node);
      }
      
      return filtered;
    }, []);
  };

  const renderNode = (node: DataSourceNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 16;
    const pathString = node.path.join('.');

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded text-sm ${
            selectedPath === pathString ? 'bg-blue-50 text-blue-700' : ''
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            } else {
              onSelect(node.path);
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <span className="w-4 mr-1" />}
          
          <span className="flex-1 flex items-center gap-2">
            <span className="font-medium">{node.label}</span>
            {node.type && (
              <span className="text-xs text-gray-500">
                {node.isArray ? `${node.type}[]` : node.type}
              </span>
            )}
          </span>
          
          {node.description && (
            <span className="text-xs text-gray-400 ml-2">{node.description}</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const categories = Object.entries(dataSources).filter(([_, nodes]) => nodes.length > 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search data sources..."
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Source Categories */}
      <Accordion.Root type="multiple" defaultValue={['database', 'user']}>
        {categories.map(([category, nodes]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const filteredNodes = filterNodes(nodes, searchQuery);
          
          if (searchQuery && filteredNodes.length === 0) return null;

          return (
            <Accordion.Item key={category} value={category} className="border-b border-gray-200 last:border-0">
              <Accordion.Header>
                <Accordion.Trigger className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                    <span className="text-xs text-gray-400">({filteredNodes.length})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 data-[state=open]:rotate-90" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="py-1">
                {filteredNodes.map(node => renderNode(node))}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500">
          No data sources available
        </div>
      )}

      {/* Search No Results */}
      {searchQuery && categories.every(([_, nodes]) => filterNodes(nodes, searchQuery).length === 0) && (
        <div className="p-8 text-center text-sm text-gray-500">
          No data sources found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};