import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useBuilderStore } from '../stores/builder.store';

export const Breadcrumb: React.FC = () => {
  const { currentApp, currentPage } = useBuilderStore();

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Canvas</span>
        {currentApp && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{currentApp.name}</span>
          </>
        )}
        {currentPage && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{currentPage.name}</span>
          </>
        )}
      </div>
    </div>
  );
};