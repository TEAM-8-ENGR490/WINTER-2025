import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVideo, 
  faWifi, // For LiDAR
  faRuler, // For ultrasonic
  faExclamationTriangle, 
  faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const SensorStatus = ({ sensors }) => {
  const { camera, lidar, ultrasonic } = sensors;
  
  // Define sensor icons
  const sensorIcons = {
    camera: faVideo,
    lidar: faWifi, // Using faWifi for LiDAR visualization
    ultrasonic: faRuler
  };
  
  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };
  
  // Function to get status icon
  const getStatusIcon = (status) => {
    return status.toLowerCase() === 'online' ? faCheck : faExclamationTriangle;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Sensor Status</h2>
      
      <div className="space-y-4">
        {Object.entries({ camera, lidar, ultrasonic }).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={sensorIcons[key]} 
                className="text-gray-600 mr-3" 
              />
              <span className="text-gray-700 capitalize">{key}</span>
            </div>
            
            <div className={`flex items-center ${getStatusColor(value)}`}>
              <span className="mr-2 capitalize">{value}</span>
              <FontAwesomeIcon 
                icon={getStatusIcon(value)} 
                className={getStatusColor(value)}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SensorStatus;
