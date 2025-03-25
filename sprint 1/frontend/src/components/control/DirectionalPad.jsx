import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowUp, 
  faArrowDown, 
  faRotateLeft, 
  faRotateRight,
  faCircle
} from '@fortawesome/free-solid-svg-icons';

const DirectionalPad = ({ disabled, onMove, onStop }) => {
  const [activeButton, setActiveButton] = useState(null);
  
  const handleButtonPress = (direction) => {
    if (disabled) return;
    
    setActiveButton(direction);
    onMove(direction);
  };
  
  const handleButtonRelease = () => {
    if (disabled) return;
    
    setActiveButton(null);
    onStop();
  };
  
  const buttons = [
    { id: 'move_forward', icon: faArrowUp, position: 'top', label: 'Forward' },
    { id: 'move_backward', icon: faArrowDown, position: 'bottom', label: 'Backward' },
    { id: 'turn_left', icon: faRotateLeft, position: 'left', label: 'Rotate Left' },
    { id: 'turn_right', icon: faRotateRight, position: 'right', label: 'Rotate Right' },
  ];
  
  return (
    <div className={`flex flex-col items-center ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-3 gap-3 relative">
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-10 h-10 rounded-full ${disabled ? 'bg-gray-300' : 'bg-gray-200'} flex items-center justify-center`}>
            <FontAwesomeIcon 
              icon={faCircle} 
              className="text-sm text-gray-400" 
            />
          </div>
        </div>
        
        {/* Control buttons */}
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`rounded-lg p-5 flex items-center justify-center ${
              activeButton === button.id 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${
              button.position === 'top' ? 'col-start-2 col-span-1 row-start-1' :
              button.position === 'right' ? 'col-start-3 col-span-1 row-start-2' :
              button.position === 'bottom' ? 'col-start-2 col-span-1 row-start-3' :
              button.position === 'left' ? 'col-start-1 col-span-1 row-start-2' : ''
            } transition-colors shadow`}
            onMouseDown={() => handleButtonPress(button.id)}
            onMouseUp={handleButtonRelease}
            onMouseLeave={() => activeButton === button.id && handleButtonRelease()}
            onTouchStart={() => handleButtonPress(button.id)}
            onTouchEnd={handleButtonRelease}
            disabled={disabled}
          >
            <div className="flex flex-col items-center">
              <FontAwesomeIcon 
                icon={button.icon} 
                className="text-lg mb-1" 
              />
              <span className="text-xs font-medium">{button.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      <p className="mt-6 text-sm text-gray-500 text-center">
        {disabled ? 'Controls disabled in current mode' : 'Press buttons to control robot movement'}
      </p>
    </div>
  );
};

export default DirectionalPad;
