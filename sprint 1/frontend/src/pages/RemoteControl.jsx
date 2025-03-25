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
  faMicrochip,
  faBug
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

// Import custom components
import ConnectionStatus from '../components/control/ConnectionStatus';
import DirectionalPad from '../components/control/DirectionalPad';
import ModeSelector from '../components/control/ModeSelector';
import SpeedControl from '../components/control/SpeedControl';
import SensorReadouts from '../components/control/SensorReadouts';
import ActionButtons from '../components/control/ActionButtons';
import SlamMap from '../components/SlamMap'; // Add SLAM Map import

const RemoteControl = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const wsRef = useRef(null);
  const controlWsRef = useRef(null);
  
  // Add debug mode state
  const [debugMode, setDebugMode] = useState(false);

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
  
  // Add debug log for test movements
  const [debugLog, setDebugLog] = useState([]);

  // Add detection tracking state like in LandingPage
  const [detections, setDetections] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);

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
        
        // Also process detection data
        if (data.detections) {
          setDetections(data.detections);
          
          // Set current target (most prominent detection)
          const topDetection = data.detections.length > 0 ? data.detections[0] : null;
          setCurrentTarget(topDetection);
        }
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
  
  // Handle joystick input - modified for debug mode
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
      
      const command = {
        action: action,
        speed: effectiveSpeed
      };
      
      // If in debug mode, add to debug log instead of sending
      if (debugMode) {
        const now = new Date();
        setDebugLog(prev => [
          {
            time: now.toLocaleTimeString(),
            command: command
          },
          ...prev.slice(0, 9) // Keep last 10 items only
        ]);
      } else if (isConnected) {
        // Only send if connected (not in debug mode)
        sendControlCommand(command);
      }
    }
  };
  
  // Handle joystick release - modified for debug mode
  const handleJoystickRelease = () => {
    setDirection({ x: 0, y: 0 });
    
    if (mode === 'manual') {
      const stopCommand = { action: 'stop' };
      
      if (debugMode) {
        const now = new Date();
        setDebugLog(prev => [
          {
            time: now.toLocaleTimeString(),
            command: stopCommand
          },
          ...prev.slice(0, 9)
        ]);
      } else if (isConnected) {
        sendControlCommand(stopCommand);
      }
    }
  };
  
  // Handle directional pad input
  const handleDirectionalMove = (direction) => {
    if (mode === 'manual') {
      const command = {
        action: direction,
        speed: speed
      };
      
      // If in debug mode, add to debug log instead of sending
      if (debugMode) {
        const now = new Date();
        setDebugLog(prev => [
          {
            time: now.toLocaleTimeString(),
            command: command
          },
          ...prev.slice(0, 9) // Keep last 10 items only
        ]);
      } else if (isConnected) {
        // Only send if connected (not in debug mode)
        sendControlCommand(command);
      }
    }
  };
  
  // Handle directional pad release
  const handleDirectionalStop = () => {
    if (mode === 'manual') {
      const stopCommand = { action: 'stop' };
      
      if (debugMode) {
        const now = new Date();
        setDebugLog(prev => [
          {
            time: now.toLocaleTimeString(),
            command: stopCommand
          },
          ...prev.slice(0, 9)
        ]);
      } else if (isConnected) {
        sendControlCommand(stopCommand);
      }
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
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    
    // If enabling debug mode, add an entry to the log
    if (newMode) {
      const now = new Date();
      setDebugLog(prev => [
        {
          time: now.toLocaleTimeString(),
          command: { action: 'debug_mode_enabled' }
        },
        ...prev
      ]);
    }
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
            
            {/* Debug Mode Toggle */}
            <button 
              onClick={toggleDebugMode}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                debugMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={faBug} className="mr-2" />
              Debug Mode {debugMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </motion.header>
        
        {/* Connection Status Banner - Hide in debug mode */}
        {!debugMode && (
          <ConnectionStatus 
            isConnected={isConnected} 
            connecting={connecting} 
            connectionError={connectionError}
            onConnect={connectToRobot}
            onDisconnect={disconnectFromRobot}
          />
        )}
        
        {/* Debug Mode Banner */}
        {debugMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-md shadow-sm"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBug} className="text-yellow-500 mr-3 text-xl" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Debug Mode Active</p>
                <p className="text-yellow-700 text-sm">
                  Use joystick without connecting to robot. Commands will be logged but not sent.
                </p>
              </div>
              <button
                onClick={toggleDebugMode}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded-md ml-4"
              >
                Disable
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Camera and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed - Updated to show detection info */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 bg-green-800 text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Live Camera Feed</h2>
                <div className="flex items-center">
                  {currentTarget && (
                    <div className="mr-4 text-sm bg-green-700 px-2 py-1 rounded">
                      <span className="font-medium">{currentTarget.class}:</span> {(currentTarget.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    disabled={!isConnected && !debugMode}
                    className={`p-2 rounded-full ${isPaused ? 'bg-green-600' : 'bg-red-600'} ${!isConnected && !debugMode && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
                  </button>
                </div>
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
                ) : debugMode ? (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faBug} className="text-4xl mb-2 text-yellow-500" />
                      <p>Debug Mode - No Camera Feed</p>
                      <p className="text-sm mt-2 text-gray-400">Joystick control is enabled for testing</p>
                    </div>
                  </div>
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
                
                {/* Add detection count overlay when connected */}
                {isConnected && imageSrc && detections.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {detections.length} object{detections.length !== 1 ? 's' : ''} detected
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Control Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DirectionalPad Control (replacing Joystick) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Manual Control</h2>
                <DirectionalPad 
                  disabled={!isConnected && !debugMode || mode !== 'manual'}
                  onMove={handleDirectionalMove}
                  onStop={handleDirectionalStop}
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
                  disabled={!isConnected && !debugMode}
                  currentMode={mode}
                  onChange={handleModeChange}
                />
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Movement Speed</h3>
                  <SpeedControl 
                    disabled={!isConnected && !debugMode}
                    value={speed}
                    onChange={handleSpeedChange}
                  />
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Right Column - Status and Actions */}
          <div className="space-y-6">
            {/* SLAM Map - Added here */}
            <SlamMap isConnected={isConnected || debugMode} />
            
            {/* Sensor Readouts or Debug Log */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              {debugMode ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Debug Command Log</h2>
                  <div className="overflow-y-auto max-h-48">
                    {debugLog.length > 0 ? (
                      <div className="space-y-2">
                        {debugLog.map((entry, index) => (
                          <div key={index} className="text-sm border-b border-gray-100 pb-1">
                            <span className="text-xs text-gray-500">{entry.time}</span>
                            <pre className="mt-1 bg-gray-50 p-1 rounded text-xs overflow-x-auto">
                              {JSON.stringify(entry.command, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No commands yet. Use the joystick to see debug data.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Sensor Readings</h2>
                  <SensorReadouts 
                    data={sensorData}
                    isConnected={isConnected}
                  />
                </>
              )}
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
                disabled={!isConnected && !debugMode}
                onAction={debugMode ? 
                  (action) => {
                    const now = new Date();
                    setDebugLog(prev => [
                      {
                        time: now.toLocaleTimeString(),
                        command: { action }
                      },
                      ...prev.slice(0, 9)
                    ]);
                  } : 
                  triggerAction
                }
                mode={mode}
                debugMode={debugMode}
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
                
                {debugMode && (
                  <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <p>Debug mode activated. Commands will not be sent to robot.</p>
                  </div>
                )}
                
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
