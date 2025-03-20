import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWifi, 
  faCircleXmark,  // Replace faWifiSlash 
  faSpinner, 
  faExclamationTriangle,
  faPlug,
  faUnlink
} from '@fortawesome/free-solid-svg-icons';

const ConnectionStatus = ({ 
  isConnected, 
  connecting, 
  connectionError,
  onConnect,
  onDisconnect
}) => {
  if (connecting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-md shadow-sm"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 mr-3 text-xl" />
          <div>
            <p className="font-medium text-blue-800">Connecting to robot...</p>
            <p className="text-blue-700 text-sm">Please wait while we establish connection.</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (connectionError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3 text-xl" />
          <div className="flex-1">
            <p className="font-medium text-red-800">Connection Error</p>
            <p className="text-red-700 text-sm">{connectionError}</p>
          </div>
          <button
            onClick={onConnect}
            className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md ml-4"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }
  
  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faWifi} className="text-green-500 mr-3 text-xl" />
          <div className="flex-1">
            <p className="font-medium text-green-800">Connected to robot</p>
            <p className="text-green-700 text-sm">Control system is ready. You can operate the robot now.</p>
          </div>
          <button
            onClick={onDisconnect}
            className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-md ml-4 flex items-center"
          >
            <FontAwesomeIcon icon={faUnlink} className="mr-1" />
            Disconnect
          </button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-100 border-l-4 border-gray-500 p-4 mb-6 rounded-md shadow-sm"
    >
      <div className="flex items-center">
        <FontAwesomeIcon icon={faCircleXmark} className="text-gray-500 mr-3 text-xl" />
        <div className="flex-1">
          <p className="font-medium text-gray-800">Not connected to robot</p>
          <p className="text-gray-700 text-sm">Connect to access remote control features.</p>
        </div>
        <button
          onClick={onConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md ml-4 flex items-center"
        >
          <FontAwesomeIcon icon={faPlug} className="mr-2" />
          Connect to Robot
        </button>
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
