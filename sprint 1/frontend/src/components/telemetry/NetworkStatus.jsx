import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNetworkWired, 
  faWifi, 
  faExclamationTriangle, 
  faSignal
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const NetworkStatus = ({ data }) => {
  const { status, latency = 0, signalStrength = 75, type = 'wifi' } = data;
  
  // Format to 2 decimal places
  const formattedLatency = parseFloat(latency).toFixed(2);
  const formattedSignalStrength = parseFloat(signalStrength).toFixed(2);
  
  // Function to determine network icon based on type
  const getNetworkIcon = () => {
    return type.toLowerCase() === 'ethernet' ? faNetworkWired : faWifi;
  };
  
  // Function to determine status color
  const getStatusColor = () => {
    if (status.toLowerCase() === 'connected') {
      if (latency > 300) return "text-yellow-500";
      return "text-green-500";
    }
    return "text-red-500";
  };
  
  // Function to determine latency quality text
  const getLatencyText = () => {
    if (latency <= 50) return "Excellent";
    if (latency <= 100) return "Good";
    if (latency <= 300) return "Fair";
    return "Poor";
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
      
      {/* Latency info */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Latency</span>
          <span className={`text-sm font-medium 
            ${latency <= 100 ? 'text-green-500' : 
              latency <= 300 ? 'text-yellow-500' : 'text-red-500'}`}>
            {formattedLatency}ms ({getLatencyText()})
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div 
            className={`h-1.5 rounded-full 
              ${latency <= 100 ? 'bg-green-500' : 
                latency <= 300 ? 'bg-yellow-500' : 'bg-red-500'}`}
            initial={{ width: '0%' }}
            animate={{ 
              width: `${Math.min(100, (latency / 500) * 100)}%`
            }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>
      
      {/* IP info (example) */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Local IP: 192.168.1.{Math.floor(Math.random() * 255)}</p>
      </div>
    </motion.div>
  );
};

export default NetworkStatus;
