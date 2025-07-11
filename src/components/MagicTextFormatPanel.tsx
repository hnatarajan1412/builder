import React, { useState } from 'react';
import { Calendar, Hash, DollarSign, Percent, Clock } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface MagicTextFormatPanelProps {
  onFormatSelect: (format: string) => void;
  trigger: React.ReactNode;
}

export const MagicTextFormatPanel: React.FC<MagicTextFormatPanelProps> = ({
  onFormatSelect,
  trigger
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const formatCategories = [
    {
      id: 'date',
      label: 'Date Formats',
      icon: Calendar,
      formats: [
        { label: 'MM/DD/YYYY', value: 'date:MM/DD/YYYY', example: '01/25/2024' },
        { label: 'DD/MM/YYYY', value: 'date:DD/MM/YYYY', example: '25/01/2024' },
        { label: 'YYYY-MM-DD', value: 'date:YYYY-MM-DD', example: '2024-01-25' },
        { label: 'Month D, YYYY', value: 'date:MMMM D, YYYY', example: 'January 25, 2024' },
        { label: 'MMM D, YYYY', value: 'date:MMM D, YYYY', example: 'Jan 25, 2024' },
        { label: 'D MMM YYYY', value: 'date:D MMM YYYY', example: '25 Jan 2024' },
      ]
    },
    {
      id: 'time',
      label: 'Time Formats',
      icon: Clock,
      formats: [
        { label: '12-hour (h:mm A)', value: 'time:h:mm A', example: '3:30 PM' },
        { label: '12-hour (hh:mm A)', value: 'time:hh:mm A', example: '03:30 PM' },
        { label: '24-hour (HH:mm)', value: 'time:HH:mm', example: '15:30' },
        { label: '24-hour with seconds', value: 'time:HH:mm:ss', example: '15:30:45' },
      ]
    },
    {
      id: 'datetime',
      label: 'Date & Time',
      icon: Calendar,
      formats: [
        { label: 'MM/DD/YYYY h:mm A', value: 'datetime:MM/DD/YYYY h:mm A', example: '01/25/2024 3:30 PM' },
        { label: 'YYYY-MM-DD HH:mm', value: 'datetime:YYYY-MM-DD HH:mm', example: '2024-01-25 15:30' },
        { label: 'MMM D, YYYY at h:mm A', value: 'datetime:MMM D, YYYY at h:mm A', example: 'Jan 25, 2024 at 3:30 PM' },
      ]
    },
    {
      id: 'number',
      label: 'Number Formats',
      icon: Hash,
      formats: [
        { label: 'Decimal (2 places)', value: 'number:2', example: '1,234.56' },
        { label: 'Decimal (no places)', value: 'number:0', example: '1,235' },
        { label: 'Decimal (4 places)', value: 'number:4', example: '1,234.5678' },
      ]
    },
    {
      id: 'currency',
      label: 'Currency',
      icon: DollarSign,
      formats: [
        { label: 'USD ($)', value: 'currency:USD', example: '$1,234.56' },
        { label: 'EUR (€)', value: 'currency:EUR', example: '€1,234.56' },
        { label: 'GBP (£)', value: 'currency:GBP', example: '£1,234.56' },
        { label: 'JPY (¥)', value: 'currency:JPY', example: '¥1,235' },
        { label: 'CAD ($)', value: 'currency:CAD', example: 'CA$1,234.56' },
        { label: 'AUD ($)', value: 'currency:AUD', example: 'A$1,234.56' },
      ]
    },
    {
      id: 'percentage',
      label: 'Percentage',
      icon: Percent,
      formats: [
        { label: 'Percentage (no decimal)', value: 'percentage:0', example: '75%' },
        { label: 'Percentage (1 decimal)', value: 'percentage:1', example: '75.5%' },
        { label: 'Percentage (2 decimals)', value: 'percentage:2', example: '75.50%' },
      ]
    }
  ];

  const handleFormatClick = (format: string) => {
    onFormatSelect(format);
    setSelectedCategory(null);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {trigger}
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto z-50"
          sideOffset={5}
        >
          <div className="p-4">
            {selectedCategory ? (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
                >
                  <span>←</span> Back
                </button>
                
                <div className="space-y-1">
                  {formatCategories
                    .find(cat => cat.id === selectedCategory)
                    ?.formats.map((format) => (
                      <button
                        key={format.value}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => handleFormatClick(format.value)}
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {format.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Example: {format.example}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Format Options
                </h3>
                
                <div className="space-y-1">
                  {formatCategories.map((category) => (
                    <button
                      key={category.id}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.label}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Select a format to apply to your dynamic content.
                    The format will be applied when the value is displayed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};