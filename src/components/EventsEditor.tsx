import React, { useState } from 'react';
import { ComponentInstance } from '../types';
import { useBuilderStore } from '../stores/builder.store';
import { Zap, Plus, Trash2, Play, MousePointer, Timer } from 'lucide-react';

interface EventsEditorProps {
  component: ComponentInstance;
}

interface EventHandler {
  id: string;
  event: string;
  action: string;
  parameters?: Record<string, any>;
}

export const EventsEditor: React.FC<EventsEditorProps> = ({ component }) => {
  const { updateComponentEvents } = useBuilderStore();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const events = component.events || [];
  const availableEvents = getAvailableEvents(component.componentId);

  const handleAddEvent = () => {
    const newEvent: EventHandler = {
      id: `event-${Date.now()}`,
      event: availableEvents[0]?.name || 'onClick',
      action: 'navigate',
      parameters: {}
    };
    
    updateComponentEvents(component.id, [...events, newEvent]);
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<EventHandler>) => {
    const updatedEvents = events.map(evt => 
      evt.id === eventId ? { ...evt, ...updates } : evt
    );
    updateComponentEvents(component.id, updatedEvents);
  };

  const handleRemoveEvent = (eventId: string) => {
    const filteredEvents = events.filter(evt => evt.id !== eventId);
    updateComponentEvents(component.id, filteredEvents);
  };

  return (
    <div className="space-y-4">
      {/* Events List */}
      <div className="sidebar-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Zap className="w-4 h-4" />
            Event Handlers
          </h3>
          <button
            onClick={handleAddEvent}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Add Event"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No events configured</p>
            <button
              onClick={handleAddEvent}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first event
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                availableEvents={availableEvents}
                isExpanded={expandedEvent === event.id}
                onToggle={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                onUpdate={(updates) => handleUpdateEvent(event.id, updates)}
                onRemove={() => handleRemoveEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Available Actions */}
      <div className="sidebar-section">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Actions</h3>
        <div className="space-y-2 text-sm">
          <ActionInfo
            icon={<Play className="w-4 h-4" />}
            name="Navigate"
            description="Navigate to another page"
          />
          <ActionInfo
            icon={<Zap className="w-4 h-4" />}
            name="API Call"
            description="Make an API request"
          />
          <ActionInfo
            icon={<MousePointer className="w-4 h-4" />}
            name="Update State"
            description="Update application state"
          />
          <ActionInfo
            icon={<Timer className="w-4 h-4" />}
            name="Show/Hide"
            description="Toggle component visibility"
          />
        </div>
      </div>
    </div>
  );
};

interface EventItemProps {
  event: EventHandler;
  availableEvents: Array<{ name: string; label: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<EventHandler>) => void;
  onRemove: () => void;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  availableEvents,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{event.event}</span>
          <span className="text-xs text-gray-500">→</span>
          <span className="text-sm text-gray-600">{event.action}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 hover:bg-red-100 rounded text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Event Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={event.event}
              onChange={(e) => onUpdate({ event: e.target.value })}
              className="property-input text-sm"
            >
              {availableEvents.map((evt) => (
                <option key={evt.name} value={evt.name}>
                  {evt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={event.action}
              onChange={(e) => onUpdate({ action: e.target.value })}
              className="property-input text-sm"
            >
              <option value="navigate">Navigate</option>
              <option value="apiCall">API Call</option>
              <option value="updateState">Update State</option>
              <option value="showAlert">Show Alert</option>
              <option value="toggleVisibility">Show/Hide</option>
              <option value="custom">Custom Function</option>
            </select>
          </div>

          {/* Action Parameters */}
          {event.action === 'navigate' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Target Page
              </label>
              <input
                type="text"
                value={event.parameters?.target || ''}
                onChange={(e) => onUpdate({ 
                  parameters: { ...event.parameters, target: e.target.value }
                })}
                placeholder="/page-path"
                className="property-input text-sm"
              />
            </div>
          )}

          {event.action === 'apiCall' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={event.parameters?.endpoint || ''}
                  onChange={(e) => onUpdate({ 
                    parameters: { ...event.parameters, endpoint: e.target.value }
                  })}
                  placeholder="/api/endpoint"
                  className="property-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Method
                </label>
                <select
                  value={event.parameters?.method || 'GET'}
                  onChange={(e) => onUpdate({ 
                    parameters: { ...event.parameters, method: e.target.value }
                  })}
                  className="property-input text-sm"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </>
          )}

          {event.action === 'updateState' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State Path
              </label>
              <input
                type="text"
                value={event.parameters?.statePath || ''}
                onChange={(e) => onUpdate({ 
                  parameters: { ...event.parameters, statePath: e.target.value }
                })}
                placeholder="user.preferences.theme"
                className="property-input text-sm"
              />
            </div>
          )}

          {event.action === 'showAlert' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alert Message
              </label>
              <input
                type="text"
                value={event.parameters?.message || ''}
                onChange={(e) => onUpdate({ 
                  parameters: { ...event.parameters, message: e.target.value }
                })}
                placeholder="Alert message..."
                className="property-input text-sm"
              />
            </div>
          )}

          {event.action === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Function Code
              </label>
              <textarea
                value={event.parameters?.code || ''}
                onChange={(e) => onUpdate({ 
                  parameters: { ...event.parameters, code: e.target.value }
                })}
                placeholder="// Custom JavaScript code"
                className="property-input text-sm font-mono"
                rows={4}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ActionInfoProps {
  icon: React.ReactNode;
  name: string;
  description: string;
}

const ActionInfo: React.FC<ActionInfoProps> = ({ icon, name, description }) => (
  <div className="flex items-start gap-3 p-2">
    <div className="text-gray-400">{icon}</div>
    <div>
      <h4 className="font-medium text-gray-900">{name}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

function getAvailableEvents(componentId: string) {
  const commonEvents = [
    { name: 'onClick', label: 'Click' },
    { name: 'onMouseEnter', label: 'Mouse Enter' },
    { name: 'onMouseLeave', label: 'Mouse Leave' }
  ];

  switch (componentId) {
    case 'button':
      return [
        ...commonEvents,
        { name: 'onFocus', label: 'Focus' },
        { name: 'onBlur', label: 'Blur' }
      ];
    case 'input':
      return [
        { name: 'onChange', label: 'Change' },
        { name: 'onFocus', label: 'Focus' },
        { name: 'onBlur', label: 'Blur' },
        { name: 'onKeyPress', label: 'Key Press' },
        { name: 'onSubmit', label: 'Submit' }
      ];
    case 'form':
      return [
        { name: 'onSubmit', label: 'Submit' },
        { name: 'onReset', label: 'Reset' }
      ];
    case 'image':
      return [
        ...commonEvents,
        { name: 'onLoad', label: 'Load' },
        { name: 'onError', label: 'Error' }
      ];
    default:
      return commonEvents;
  }
}