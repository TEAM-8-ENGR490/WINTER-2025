import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faRobot,
  faGamepad,
  faWifi,
  faCircleXmark, // Replace faWifiSlash
  faVideo,
  faChartLine,
  faInfoCircle,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faCircle,
  faStop,
  faCog,
  faLightbulb,
  faMicrochip
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

// Import custom components
import ConnectionStatus from '../components/control/ConnectionStatus';
import JoystickControl from '../components/control/JoystickControl';
import ModeSelector from '../components/control/ModeSelector';
import SpeedControl from '../components/control/SpeedControl';
import SensorReadouts from '../components/control/SensorReadouts';
import ActionButtons from '../components/control/ActionButtons';

const RemoteControl = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const wsRef = useRef(null);
  const controlWsRef = useRef(null);

  // Control state
  const [mode, setMode] = useState('manual'); // 'manual', 'semi-auto', 'auto'
  const [speed, setSpeed] = useState(50); // 0-100
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(true);
  const [sensorData, setSensorData] = useState({
    proximity: 0,
    battery: 100,
    temperature: 25
  });

  // Function to connect to the Raspberry Pi
  const connectToRobot = () => {
    setConnecting(true);
    setConnectionError(null);
    
    const PI_ADDRESS = import.meta.env.VITE_PI_ADDRESS || "100.73.143.76";
    
    // Connect to camera feed
    const cameraWs = new WebSocket(`ws://${PI_ADDRESS}:49078/camera_feed`);
    
    cameraWs.onopen = () => {
      console.log("Camera WebSocket connection established");
      wsRef.current = cameraWs;
      
      // Now connect to control WebSocket
      const controlWs = new WebSocket(`ws://${PI_ADDRESS}:49078/robot_control`);
      
      controlWs.onopen = () => {
        console.log("Control WebSocket connection established");
        controlWsRef.current = controlWs;
        setIsConnected(true);
        setConnecting(false);
        
        // Send initial state
        sendControlCommand({
          action: 'status',
          mode: mode,
          speed: speed
        });
      };
      
      controlWs.onerror = (error) => {
        console.error("Control WebSocket error:", error);
        setConnectionError("Failed to connect control channel. Check if the robot is powered on.");
        setConnecting(false);
      };
      
      controlWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update sensor data
          if (data.sensors) {
            setSensorData(data.sensors);
          }
          
          // Handle status updates or confirmations
          if (data.status === 'error') {
            console.error("Control error:", data.message);
          }
        } catch (err) {
          console.error("Error parsing control message:", err);
        }
      };
      
      controlWs.onclose = () => {
        console.log("Control WebSocket connection closed");
        setIsConnected(false);
      };
    };
    
    cameraWs.onerror = (error) => {
      console.error("Camera WebSocket error:", error);
      setConnectionError("Failed to connect to the robot camera. Check if the robot is powered on.");
      setConnecting(false);
    };
    
    cameraWs.onmessage = (event) => {
      if (isPaused) return;
      try {
        const data = JSON.parse(event.data);
        setImageSrc(data.image);
      } catch (err) {
        console.error("Error parsing camera message:", err);
      }
    };
    
    cameraWs.onclose = () => {
      console.log("Camera WebSocket connection closed");
      setIsConnected(false);
    };
  };
  
  // Function to disconnect from the Raspberry Pi
  const disconnectFromRobot = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (controlWsRef.current) {
      controlWsRef.current.close();
      controlWsRef.current = null;
    }
    
    setIsConnected(false);
    setIsPaused(true);
  };
  
  // Function to send control commands to the robot
  const sendControlCommand = (command) => {
    if (controlWsRef.current && controlWsRef.current.readyState === WebSocket.OPEN) {
      controlWsRef.current.send(JSON.stringify(command));
    }
  };
  
  // Handle joystick input
  const handleJoystickMove = (x, y) => {
    setDirection({ x, y });
    
    // Convert joystick coordinates to motor commands
    if (mode === 'manual') {
      let action;
      
      // Determine direction based on joystick position
      if (Math.abs(y) > Math.abs(x)) {
        // Forward/backward motion dominates
        action = y < -0.3 ? 'move_forward' : y > 0.3 ? 'move_backward' : 'stop';
      } else if (Math.abs(x) > 0.3) {
        // Left/right motion dominates
        action = x < -0.3 ? 'turn_left' : 'turn_right';
      } else {
        // Neutral position
        action = 'stop';
      }
      
      // Calculate effective speed based on joystick distance from center
      const distance = Math.min(1, Math.sqrt(x*x + y*y));
      const effectiveSpeed = Math.round(speed * distance);
      
      sendControlCommand({
        action: action,
        speed: effectiveSpeed
      });
    }
  };
  
  // Handle joystick release
  const handleJoystickRelease = () => {
    setDirection({ x: 0, y: 0 });
    
    if (mode === 'manual') {
      sendControlCommand({
        action: 'stop'
      });
    }
  };
  
  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    sendControlCommand({
      action: 'set_mode',
      mode: newMode
    });
  };
  
  // Handle speed change
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    sendControlCommand({
      action: 'set_speed',
      speed: newSpeed
    });
  };
  
  // Trigger special actions
  const triggerAction = (actionType) => {
    sendControlCommand({
      action: actionType
    });
  };
  
  // Clean up WebSocket connections when component unmounts
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (controlWsRef.current) {
        controlWsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex flex-col md:flex-row justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">
            Green Guardian Robot Control
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <Link to="/detection" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
              <FontAwesomeIcon icon={faVideo} className="mr-2" />
              Detection Dashboard
            </Link>
            
            <Link to="/telemetry" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
              <FontAwesomeIcon icon={faMicrochip} className="mr-2" />
              System Health
            </Link>
          </div>
        </motion.header>
        
        {/* Connection Status Banner */}
        <ConnectionStatus 
          isConnected={isConnected} 
          connecting={connecting} 
          connectionError={connectionError}
          onConnect={connectToRobot}
          onDisconnect={disconnectFromRobot}
        />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Camera and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 bg-green-800 text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Live Camera Feed</h2>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  disabled={!isConnected}
                  className={`p-2 rounded-full ${isPaused ? 'bg-green-600' : 'bg-red-600'} ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
                >
                  <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
                </button>
              </div>
              
              <div className="relative bg-gray-900 w-full" style={{ height: '360px' }}>
                {isConnected ? (
                  imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="Robot camera feed" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      {isPaused ? (
                        <div className="text-center">
                          <FontAwesomeIcon icon={faPause} className="text-4xl mb-2" />
                          <p>Feed paused. Click play to resume.</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl mb-2" />
                          <p>Waiting for video feed...</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faCircleXmark} className="text-4xl mb-2" />
                      <p>Not connected to robot</p>
                      <button 
                        onClick={connectToRobot}
                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={connecting}
                      >
                        {connecting ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faWifi} className="mr-2" />
                            Connect Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Control Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Joystick Control */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Manual Control</h2>
                <JoystickControl 
                  disabled={!isConnected || mode !== 'manual'}
                  onMove={handleJoystickMove}
                  onRelease={handleJoystickRelease}
                />
              </motion.div>
              
              {/* Mode and Speed Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Operation Mode</h2>
                
                <ModeSelector 
                  disabled={!isConnected}
                  currentMode={mode}
                  onChange={handleModeChange}
                />
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Movement Speed</h3>
                  <SpeedControl 
                    disabled={!isConnected}
                    value={speed}
                    onChange={handleSpeedChange}
                  />
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Right Column - Status and Actions */}
          <div className="space-y-6">
            {/* Sensor Readouts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sensor Readings</h2>
              <SensorReadouts 
                data={sensorData}
                isConnected={isConnected}
              />
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <ActionButtons 
                disabled={!isConnected}
                onAction={triggerAction}
                mode={mode}
              />
            </motion.div>
            
            {/* Status Messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-md p-4 h-64 overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Log</h2>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-green-100 text-green-800 rounded">
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <p>System initialized. Ready for connection.</p>
                </div>
                
                {isConnected && (
                  <div className="p-2 bg-blue-100 text-blue-800 rounded">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <p>Connected to robot control system.</p>
                  </div>
                )}
                
                {mode === 'auto' && (
                  <div className="p-2 bg-purple-100 text-purple-800 rounded">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <p>Autonomous mode activated. Robot is self-directing.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteControl;
