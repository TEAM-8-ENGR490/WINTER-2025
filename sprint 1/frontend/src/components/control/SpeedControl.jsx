import React from 'react';
import { motion } from 'framer-motion';

const SpeedControl = ({ disabled, value, onChange }) => {
  // Predefined speed presets
  const speedPresets = [10, 25, 50, 75, 100];
  
  // Get color based on speed value
  const getSpeedColor = () => {
    if (value <= 25) return 'bg-green-500';
    if (value <= 50) return 'bg-blue-500';
    if (value <= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get text description based on speed value
  const getSpeedDescription = () => {
    if (value <= 25) return 'Slow';
    if (value <= 50) return 'Medium';
    if (value <= 75) return 'Fast';
    return 'Maximum';
  };
  
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      {/* Main slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {getSpeedDescription()}
          </span>
          <span className={`text-sm font-bold ${disabled ? 'text-gray-400' : getSpeedColor().replace('bg-', 'text-')}`}>
            {value}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <motion.div 
            className={`h-2.5 rounded-full ${getSpeedColor()}`}
            initial={{ width: '0%' }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>
      
      {/* Quick preset buttons */}
      <div className="flex justify-between">
        {speedPresets.map(preset => (
          <button
            key={preset}
            onClick={() => !disabled && onChange(preset)}
            disabled={disabled}
            className={`px-2 py-1 rounded text-xs ${
              value === preset
                ? `bg-green-500 text-white`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {preset}%
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedControl;
