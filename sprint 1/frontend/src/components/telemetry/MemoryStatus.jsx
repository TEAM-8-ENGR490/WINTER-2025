import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMemory } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const MemoryStatus = ({ data }) => {
  const { used = 0, total = 100, percentage = 0 } = data;
  
  // Format to 2 decimal places
  const formattedPercentage = parseFloat(percentage).toFixed(2);
  
  // Function to format memory values (GB with 2 decimal places)
  const formatMemory = (value) => {
    const inGB = value / 1024;
    return `${parseFloat(inGB).toFixed(2)} GB`;
  };
  
  // Function to determine color based on memory usage
  const getMemoryColor = () => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };
  
  // Function to get progress bar color
  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-lg shadow p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Memory</h2>
        <FontAwesomeIcon icon={faMemory} className="text-gray-400" />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xl font-bold ${getMemoryColor()}`}>{formattedPercentage}%</span>
        <span className="text-gray-600 text-sm">
          {formatMemory(used)} / {formatMemory(total)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <motion.div 
          className={`h-2.5 rounded-full ${getProgressColor()}`}
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Available: {formatMemory(total - used)}</span>
        <span className={`font-medium ${getMemoryColor()}`}>
          {percentage >= 90 ? "Critical" : percentage >= 70 ? "High" : "Normal"}
        </span>
      </div>
    </motion.div>
  );
};

export default MemoryStatus;
