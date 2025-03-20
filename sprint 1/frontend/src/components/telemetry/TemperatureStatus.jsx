import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThermometerEmpty, 
  faThermometerQuarter, 
  faThermometerHalf, 
  faThermometerThreeQuarters, 
  faThermometerFull 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const TemperatureStatus = ({ temperature = 0 }) => {
  // Format to 2 decimal places
  const formattedTemp = parseFloat(temperature).toFixed(2);
  
  // Function to get temperature icon
  const getTempIcon = () => {
    if (temperature >= 80) return faThermometerFull;
    if (temperature >= 65) return faThermometerThreeQuarters;
    if (temperature >= 50) return faThermometerHalf;
    if (temperature >= 35) return faThermometerQuarter;
    return faThermometerEmpty;
  };
  
  // Function to get temperature status text
  const getTempStatus = () => {
    if (temperature >= 85) return "Dangerous";
    if (temperature >= 80) return "Critical";
    if (temperature >= 70) return "Hot";
    if (temperature >= 60) return "Warm";
    return "Normal";
  };
  
  // Function to get temperature color
  const getTempColor = () => {
    if (temperature >= 85) return "text-red-700";
    if (temperature >= 80) return "text-red-600";
    if (temperature >= 70) return "text-red-500";
    if (temperature >= 60) return "text-orange-500";
    if (temperature >= 50) return "text-yellow-500";
    return "text-green-500";
  };
  
  // Calculate progress for progress bar (0-85%)
  // 85°C is considered the absolute max safe temperature
  const progressPercentage = Math.min(100, (temperature / 85) * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Temperature</h2>
        <FontAwesomeIcon icon={getTempIcon()} className={getTempColor()} />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xl font-bold ${getTempColor()}`}>{formattedTemp}°C</span>
        <span className={`text-sm font-medium ${getTempColor()}`}>{getTempStatus()}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <motion.div 
          className={`h-2.5 rounded-full ${
            temperature >= 80 ? "bg-red-600" : 
            temperature >= 70 ? "bg-red-500" : 
            temperature >= 60 ? "bg-orange-500" : 
            temperature >= 50 ? "bg-yellow-500" : 
            "bg-green-500"
          }`}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {temperature < 60 ? "Safe Operating Range" : 
           temperature < 80 ? "Warning Threshold" : 
           "Shutdown Imminent"}
        </span>
        <span className="text-gray-500">85°C max</span>
      </div>
    </motion.div>
  );
};

export default TemperatureStatus;
