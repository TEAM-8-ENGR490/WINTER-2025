import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStop, 
  faSyncAlt, 
  faSearch, 
  faHome
} from '@fortawesome/free-solid-svg-icons';

const ActionButtons = ({ disabled, onAction, mode }) => {
  // List of quick actions (removed sound horn and toggle lights)
  const actions = [
    {
      id: 'emergency_stop',
      name: 'Emergency Stop',
      icon: faStop,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Immediately stop all movement',
      alwaysEnabled: true
    },
    {
      id: 'return_home',
      name: 'Return Home',
      icon: faHome,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Navigate back to starting point',
      autoOnly: true
    },
    {
      id: 'scan_area',
      name: 'Scan Area',
      icon: faSearch,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Perform a 360° scan of surroundings',
      autoOnly: false
    },
    {
      id: 'reset_system',
      name: 'Reset System',
      icon: faSyncAlt,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Reset system status',
      autoOnly: false
    }
  ];
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(action => {
        // Determine if button should be disabled
        const buttonDisabled = disabled || 
          (action.autoOnly && mode !== 'auto' && mode !== 'semi-auto') ||
          (!action.alwaysEnabled && disabled);
          
        return (
          <button
            key={action.id}
            onClick={() => !buttonDisabled && onAction(action.id)}
            disabled={buttonDisabled}
            className={`p-2 rounded-lg text-white ${action.color} flex flex-col items-center justify-center transition-colors ${
              buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FontAwesomeIcon icon={action.icon} className="text-lg mb-1" />
            <span className="text-xs font-medium">{action.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
