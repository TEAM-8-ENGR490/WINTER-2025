import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGamepad, 
  faRobot, 
  faMagic 
} from '@fortawesome/free-solid-svg-icons';

const ModeSelector = ({ disabled, currentMode, onChange }) => {
  const modes = [
    { 
      id: 'manual', 
      name: 'Manual Control', 
      icon: faGamepad, 
      description: 'Full manual control using joystick' 
    },
    { 
      id: 'semi-auto', 
      name: 'Semi-Autonomous', 
      icon: faMagic, 
      description: 'AI-assisted control with manual override' 
    },
    { 
      id: 'auto', 
      name: 'Full Autonomous', 
      icon: faRobot, 
      description: 'Robot operates independently' 
    }
  ];
  
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className="space-y-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => !disabled && onChange(mode.id)}
            disabled={disabled}
            className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
              currentMode === mode.id 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              currentMode === mode.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <FontAwesomeIcon icon={mode.icon} />
            </div>
            <div className="ml-3 text-left">
              <h3 className="font-medium">{mode.name}</h3>
              <p className="text-xs text-gray-500">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
