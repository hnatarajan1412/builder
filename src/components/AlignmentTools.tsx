import React from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Columns3,
  Rows3
} from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';

export const AlignmentTools: React.FC = () => {
  const { selectedComponent, updateComponentStyle } = useBuilderStore();

  if (!selectedComponent) return null;

  const alignments = [
    { icon: AlignLeft, title: 'Align Left', style: { justifyContent: 'flex-start', textAlign: 'left' } },
    { icon: AlignCenter, title: 'Align Center', style: { justifyContent: 'center', textAlign: 'center' } },
    { icon: AlignRight, title: 'Align Right', style: { justifyContent: 'flex-end', textAlign: 'right' } },
  ];

  const verticalAlignments = [
    { icon: AlignStartVertical, title: 'Align Top', style: { alignItems: 'flex-start' } },
    { icon: AlignCenterVertical, title: 'Align Middle', style: { alignItems: 'center' } },
    { icon: AlignEndVertical, title: 'Align Bottom', style: { alignItems: 'flex-end' } },
  ];

  const distributions = [
    { icon: Columns3, title: 'Distribute Horizontally', style: { display: 'flex', gap: '1rem' } },
    { icon: Rows3, title: 'Distribute Vertically', style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
  ];

  const handleAlignment = (style: Record<string, any>) => {
    updateComponentStyle(selectedComponent.id, style);
  };

  const isContainer = selectedComponent.componentId === 'container' || selectedComponent.componentId === 'form';

  return (
    <div className="p-4 border-b border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Alignment</h4>
      
      {/* Horizontal Alignment */}
      <div className="flex items-center gap-1 mb-3">
        {alignments.map(({ icon: Icon, title, style }) => (
          <button
            key={title}
            onClick={() => handleAlignment(style)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title={title}
          >
            <Icon className="w-4 h-4 text-gray-600" />
          </button>
        ))}
      </div>

      {/* Vertical Alignment (for containers) */}
      {isContainer && (
        <>
          <div className="flex items-center gap-1 mb-3">
            {verticalAlignments.map(({ icon: Icon, title, style }) => (
              <button
                key={title}
                onClick={() => handleAlignment(style)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title={title}
              >
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>

          {/* Distribution */}
          <div className="flex items-center gap-1">
            {distributions.map(({ icon: Icon, title, style }) => (
              <button
                key={title}
                onClick={() => handleAlignment(style)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title={title}
              >
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};