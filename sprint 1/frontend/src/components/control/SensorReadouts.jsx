import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faThermometerHalf
} from '@fortawesome/free-solid-svg-icons';

const SensorReadouts = ({ data, isConnected }) => {
  const { distance = 0, temperature = 25 } = data;
  
  // Format values to 1 decimal place
  const formattedDistance = parseFloat(distance).toFixed(1);
  const formattedTemperature = parseFloat(temperature).toFixed(1);
  
  // Color indicators for values
  const getDistanceColor = () => {
    if (distance > 100) return 'text-red-500';
    if (distance > 50) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const getTemperatureColor = () => {
    if (temperature > 80) return 'text-red-500';
    if (temperature > 60) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // Progress bar widths
  const distanceWidth = `${Math.min(100, (distance / 150) * 100)}%`;
  const temperatureWidth = `${Math.min(100, (temperature / 85) * 100)}%`;
  
  return (
    <div className={!isConnected ? 'opacity-50' : ''}>
      {/* Distance from Home */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">Distance from Home</span>
          </div>
          <span className={`text-sm font-medium ${getDistanceColor()}`}>{formattedDistance} m</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${distance > 100 ? 'bg-red-500' : distance > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: distanceWidth }}
          ></div>
        </div>
      </div>
      
      {/* Temperature Sensor */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faThermometerHalf} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">System Temperature</span>
          </div>
          <span className={`text-sm font-medium ${getTemperatureColor()}`}>{formattedTemperature}°C</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${temperature > 80 ? 'bg-red-500' : temperature > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: temperatureWidth }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SensorReadouts;
