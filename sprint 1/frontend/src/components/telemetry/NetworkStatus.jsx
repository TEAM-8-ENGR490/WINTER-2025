import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNetworkWired, 
  faWifi, 
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const NetworkStatus = ({ data }) => {
  const { status, signalStrength = 75, type = 'wifi' } = data;
  
  // Format to 2 decimal places
  const formattedSignalStrength = parseFloat(signalStrength).toFixed(2);
  
  // Function to determine network icon based on type
  const getNetworkIcon = () => {
    return type.toLowerCase() === 'ethernet' ? faNetworkWired : faWifi;
  };
  
  // Function to determine status color
  const getStatusColor = () => {
    if (status.toLowerCase() === 'connected') {
      return "text-green-500";
    }
    return "text-red-500";
  };
  
  // Function to get signal bars based on strength
  const getSignalBars = () => {
    if (type.toLowerCase() === 'ethernet') return null;
    
    const bars = [];
    const totalBars = 4;
    const filledBars = Math.ceil((signalStrength / 100) * totalBars);
    
    for (let i = 0; i < totalBars; i++) {
      const isFilled = i < filledBars;
      bars.push(
        <div 
          key={i}
          className={`w-1.5 mx-0.5 rounded-sm ${isFilled ? 'bg-green-500' : 'bg-gray-300'}`} 
          style={{ height: `${(i + 1) * 3 + 2}px` }}
        ></div>
      );
    }
    
    return (
      <div className="flex items-end h-4">
        {bars}
      </div>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Network Status</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon 
            icon={getNetworkIcon()} 
            className={`text-xl mr-3 ${getStatusColor()}`} 
          />
          <div>
            <p className="text-gray-700 font-medium capitalize">{type}</p>
            <p className={`text-sm ${getStatusColor()} capitalize`}>{status}</p>
          </div>
        </div>
        
        {/* Signal Strength for WiFi */}
        {type.toLowerCase() === 'wifi' && (
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              {getSignalBars()}
            </div>
            <p className="text-xs text-gray-500">{formattedSignalStrength}% Signal</p>
          </div>
        )}
      </div>
      
      {/* IP info (example) */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Local IP: 192.168.1.{Math.floor(Math.random() * 255)}</p>
      </div>
    </motion.div>
  );
};

export default NetworkStatus;
