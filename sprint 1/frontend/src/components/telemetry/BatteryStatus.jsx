import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBatteryFull, 
  faBatteryThreeQuarters, 
  faBatteryHalf, 
  faBatteryQuarter, 
  faBatteryEmpty,
  faBolt 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const BatteryStatus = ({ data }) => {
  const { level = 0, charging = false, voltage = 0 } = data;
  
  // Format level and voltage to 2 decimal places
  const formattedLevel = parseFloat(level).toFixed(2);
  const formattedVoltage = parseFloat(voltage).toFixed(2);
  
  // Function to get battery icon based on level
  const getBatteryIcon = () => {
    if (level >= 87.5) return faBatteryFull;
    if (level >= 62.5) return faBatteryThreeQuarters;
    if (level >= 37.5) return faBatteryHalf;
    if (level >= 12.5) return faBatteryQuarter;
    return faBatteryEmpty;
  };
  
  // Function to get status info
  const getStatusInfo = () => {
    if (level <= 20) return { text: "Low", color: "text-red-500" };
    if (level <= 40) return { text: "Moderate", color: "text-yellow-500" };
    return { text: "Good", color: "text-green-500" };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Battery</h2>
        {charging && (
          <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
        )}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <FontAwesomeIcon 
          icon={getBatteryIcon()} 
          className={`text-2xl ${level <= 20 ? 'text-red-500' : 'text-green-500'}`} 
        />
        <span className="text-xl font-bold text-gray-800">{formattedLevel}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <motion.div 
          className={`h-2.5 rounded-full ${level <= 20 ? 'bg-red-500' : level <= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1 }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Voltage: {formattedVoltage}V</span>
        <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
      </div>
    </motion.div>
  );
};

export default BatteryStatus;
