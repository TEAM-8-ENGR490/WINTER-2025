import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowUp, 
  faArrowDown, 
  faArrowLeft, 
  faArrowRight,
  faBan,
  faCircle  // Make sure faCircle is properly imported
} from '@fortawesome/free-solid-svg-icons';

const JoystickControl = ({ disabled, onMove, onRelease }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [joystickSize, setJoystickSize] = useState({ width: 0, height: 0 });

  // Initialize joystick size
  useEffect(() => {
    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      setJoystickSize({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  // Handle touch and mouse events
  useEffect(() => {
    const joystick = joystickRef.current;
    
    const handleStart = (clientX, clientY) => {
      if (disabled) return;
      
      const rect = joystick.getBoundingClientRect();
      setIsDragging(true);
      updatePosition(clientX - rect.left, clientY - rect.top);
    };
    
    const handleMove = (clientX, clientY) => {
      if (!isDragging || disabled) return;
      
      const rect = joystick.getBoundingClientRect();
      updatePosition(clientX - rect.left, clientY - rect.top);
    };
    
    const handleEnd = () => {
      if (disabled) return;
      
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onRelease();
    };
    
    // Mouse events
    const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = handleEnd;
    
    // Touch events
    const onTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };
    
    const onTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    
    const onTouchEnd = (e) => {
      e.preventDefault();
      handleEnd();
    };
    
    // Add event listeners
    if (joystick) {
      joystick.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      joystick.addEventListener('touchstart', onTouchStart);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    }
    
    // Cleanup
    return () => {
      if (joystick) {
        joystick.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        joystick.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [isDragging, disabled, onRelease]);

  // Update position of the joystick handle
  const updatePosition = (x, y) => {
    const centerX = joystickSize.width / 2;
    const centerY = joystickSize.height / 2;
    
    // Calculate distance from center
    let deltaX = x - centerX;
    let deltaY = y - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Max radius is 40% of joystick width
    const maxRadius = joystickSize.width * 0.4;
    
    // If distance is greater than max radius, normalize
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }
    
    // Update position
    setPosition({
      x: deltaX,
      y: deltaY
    });
    
    // Calculate normalized position (-1 to 1)
    const normalizedX = deltaX / maxRadius;
    const normalizedY = deltaY / maxRadius;
    
    // Send to parent component
    onMove(normalizedX, normalizedY);
  };

  // Determine direction for UI indicators
  const getDirectionIntensity = () => {
    const normalizedX = position.x / (joystickSize.width * 0.4);
    const normalizedY = position.y / (joystickSize.height * 0.4);
    
    return {
      up: -normalizedY > 0.3 ? Math.min(1, -normalizedY * 1.5) : 0,
      down: normalizedY > 0.3 ? Math.min(1, normalizedY * 1.5) : 0,
      left: -normalizedX > 0.3 ? Math.min(1, -normalizedX * 1.5) : 0,
      right: normalizedX > 0.3 ? Math.min(1, normalizedX * 1.5) : 0
    };
  };
  
  const intensity = getDirectionIntensity();

  return (
    <div className={`flex flex-col items-center ${disabled ? 'opacity-50' : ''}`}>
      {/* Direction indicators */}
      <div className="grid grid-cols-3 gap-1 mb-4 w-32">
        <div className="col-start-2 text-center">
          <FontAwesomeIcon 
            icon={faArrowUp} 
            className={`text-lg ${intensity.up > 0 
              ? `text-green-${Math.floor(intensity.up * 700)}` 
              : 'text-gray-300'}`} 
          />
        </div>
        <div className="col-start-1 row-start-2 text-center">
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            className={`text-lg ${intensity.left > 0 
              ? `text-green-${Math.floor(intensity.left * 700)}` 
              : 'text-gray-300'}`} 
          />
        </div>
        <div className="col-start-2 row-start-2 text-center">
          <FontAwesomeIcon 
            icon={disabled ? faBan : faCircle} 
            className={`text-sm ${disabled ? 'text-red-400' : 'text-gray-400'}`} 
          />
        </div>
        <div className="col-start-3 row-start-2 text-center">
          <FontAwesomeIcon 
            icon={faArrowRight} 
            className={`text-lg ${intensity.right > 0 
              ? `text-green-${Math.floor(intensity.right * 700)}` 
              : 'text-gray-300'}`} 
          />
        </div>
        <div className="col-start-2 row-start-3 text-center">
          <FontAwesomeIcon 
            icon={faArrowDown} 
            className={`text-lg ${intensity.down > 0 
              ? `text-green-${Math.floor(intensity.down * 700)}` 
              : 'text-gray-300'}`} 
          />
        </div>
      </div>
      
      {/* Joystick container */}
      <div 
        ref={joystickRef}
        className={`relative w-48 h-48 rounded-full border-2 ${disabled ? 'border-gray-300 bg-gray-100' : 'border-green-300 bg-green-50'} mx-auto select-none touch-none`}
        style={{ touchAction: 'none' }}
      >
        {/* Joystick handle */}
        <div
          ref={knobRef}
          className={`absolute w-16 h-16 rounded-full ${disabled ? 'bg-gray-400' : 'bg-green-500'} shadow-md flex items-center justify-center`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            top: `calc(50% - 2rem)`,
            left: `calc(50% - 2rem)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: disabled ? 'not-allowed' : 'grab'
          }}
        >
          <div className="w-10 h-10 rounded-full bg-white opacity-20"></div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        {disabled ? 'Joystick disabled in current mode' : 'Drag to control robot movement'}
      </p>
    </div>
  );
};

export default JoystickControl;
