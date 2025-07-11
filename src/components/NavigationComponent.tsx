import React from 'react';
import { ComponentInstance } from '../types';
import { useAppStateStore } from '../stores/app-state.store';
import { ChevronRight, Home, ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationComponentProps {
  component: ComponentInstance;
  isSelected?: boolean;
  onSelect?: () => void;
  isPreview?: boolean;
}

export const NavigationComponent: React.FC<NavigationComponentProps> = ({
  component,
  isSelected,
  onSelect,
  isPreview = false
}) => {
  const { navigate, currentRoute, goBack, goForward, canGoBack, canGoForward } = useAppStateStore();
  const { props = {} } = component;
  
  const navType = props.type || 'menu';
  const orientation = props.orientation || 'horizontal';
  const showIcons = props.showIcons !== false;
  const showBreadcrumbs = props.showBreadcrumbs !== false;
  
  // Mock navigation items (in real app, these would come from pages or props)
  const navItems = props.items || [
    { id: '1', label: 'Home', path: '/', icon: 'home' },
    { id: '2', label: 'Products', path: '/products', icon: 'package' },
    { id: '3', label: 'About', path: '/about', icon: 'info' },
    { id: '4', label: 'Contact', path: '/contact', icon: 'mail' }
  ];
  
  const handleNavigation = (path: string) => {
    if (isPreview) {
      navigate(path);
    }
  };
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'package':
        return <span>📦</span>;
      case 'info':
        return <span>ℹ️</span>;
      case 'mail':
        return <span>✉️</span>;
      default:
        return null;
    }
  };
  
  if (!isPreview) {
    // Builder mode - show navigation structure
    return (
      <div 
        className={`navigation-container border-2 border-dashed rounded-lg p-4 ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={onSelect}
      >
        <div className="navigation-header mb-3">
          <h3 className="text-sm font-medium text-gray-700">Navigation Component</h3>
          <p className="text-xs text-gray-500">
            Type: {navType} • Orientation: {orientation}
          </p>
        </div>
        
        {/* Navigation Preview */}
        <div className={`navigation-preview ${
          orientation === 'vertical' ? 'space-y-1' : 'flex space-x-1'
        }`}>
          {navItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded text-sm text-gray-700"
            >
              {showIcons && getIcon(item.icon)}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Preview mode - functional navigation
  switch (navType) {
    case 'breadcrumbs':
      return (
        <nav className="breadcrumbs flex items-center space-x-1 text-sm text-gray-600">
          <button 
            onClick={() => handleNavigation('/')}
            className="hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          
          {currentRoute !== '/' && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {currentRoute.replace('/', '').replace('-', ' ') || 'Current Page'}
              </span>
            </>
          )}
        </nav>
      );
      
    case 'tabs':
      return (
        <div className="navigation-tabs border-b border-gray-200">
          <nav className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {showIcons && getIcon(item.icon)}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      );
      
    case 'sidebar':
      return (
        <nav className={`navigation-sidebar space-y-1 ${
          orientation === 'horizontal' ? 'flex space-y-0 space-x-1' : ''
        }`}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {showIcons && getIcon(item.icon)}
                {item.label}
              </button>
            );
          })}
        </nav>
      );
      
    case 'pagination':
      return (
        <nav className="pagination flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item, index) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </nav>
      );
      
    default: // menu
      return (
        <nav className={`navigation-menu ${
          orientation === 'vertical' ? 'space-y-1' : 'flex space-x-4'
        }`}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showIcons && getIcon(item.icon)}
                {item.label}
              </button>
            );
          })}
        </nav>
      );
  }
};