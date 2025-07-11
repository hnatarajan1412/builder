import React from 'react';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full';

interface ViewportConfig {
  width: string;
  height: string;
  scale?: number;
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  mobile: { width: '375px', height: '667px', scale: 0.8 },
  tablet: { width: '768px', height: '1024px', scale: 0.7 },
  desktop: { width: '1280px', height: '800px', scale: 0.8 },
  full: { width: '100%', height: '100%', scale: 1 }
};

export const ViewportControls: React.FC = () => {
  const { viewport, setViewport } = useBuilderStore();

  const buttons = [
    { size: 'mobile' as ViewportSize, icon: Smartphone, label: 'Mobile' },
    { size: 'tablet' as ViewportSize, icon: Tablet, label: 'Tablet' },
    { size: 'desktop' as ViewportSize, icon: Monitor, label: 'Desktop' },
    { size: 'full' as ViewportSize, icon: Maximize2, label: 'Full Width' }
  ];

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 border-b border-gray-200">
      <span className="text-sm text-gray-600 mr-2">Viewport:</span>
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
        {buttons.map(({ size, icon: Icon, label }) => (
          <button
            key={size}
            onClick={() => setViewport(size)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${viewport === size 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
      
      {viewport !== 'full' && (
        <div className="ml-4 text-sm text-gray-500">
          {viewportConfigs[viewport].width} × {viewportConfigs[viewport].height}
        </div>
      )}
    </div>
  );
};

export const ViewportWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { viewport } = useBuilderStore();
  const config = viewportConfigs[viewport];

  if (viewport === 'full') {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center h-full bg-gray-100 p-8">
      <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          width: config.width,
          height: config.height,
          transform: `scale(${config.scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Device frame */}
        <div className="absolute inset-0 pointer-events-none">
          {viewport === 'mobile' && (
            <>
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full" />
            </>
          )}
          {viewport === 'tablet' && (
            <>
              {/* Tablet bezel */}
              <div className="absolute inset-0 border-8 border-gray-900 rounded-2xl" />
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="relative w-full h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};