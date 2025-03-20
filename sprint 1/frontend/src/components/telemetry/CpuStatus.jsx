import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const CpuStatus = ({ data }) => {
  const { usage = 0, frequency = 0 } = data;
  
  // Format to 2 decimal places
  const formattedUsage = parseFloat(usage).toFixed(2);
  const formattedFreq = parseFloat(frequency).toFixed(2);
  
  // Function to determine status color based on CPU usage
  const getStatusColor = () => {
    if (usage >= 80) return "text-red-500";
    if (usage >= 50) return "text-yellow-500";
    return "text-green-500";
  };
  
  // Get color for progress bar
  const getProgressColor = () => {
    if (usage >= 80) return "bg-red-500";
    if (usage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">CPU</h2>
        <FontAwesomeIcon icon={faMicrochip} className="text-gray-400" />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xl font-bold ${getStatusColor()}`}>{formattedUsage}%</span>
        <span className="text-gray-600 text-sm">{formattedFreq} GHz</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <motion.div 
          className={`h-2.5 rounded-full ${getProgressColor()}`}
          initial={{ width: '0%' }}
          animate={{ width: `${usage}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Frequency</span>
        <span className={`font-medium ${getStatusColor()}`}>
          {usage >= 80 ? "High" : usage >= 50 ? "Medium" : "Low"}
        </span>
      </div>
    </motion.div>
  );
};

export default CpuStatus;
