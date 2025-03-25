import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

const SlamMap = ({ isConnected }) => {
  const canvasRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [robotPosition, setRobotPosition] = useState({ x: 0.5, y: 0.5 });
  
  // Simulated obstacles for the placeholder map
  const obstacles = [
    { x1: 0.1, y1: 0.1, x2: 0.8, y2: 0.1, width: 0.03 }, // Top wall
    { x1: 0.1, y1: 0.1, x2: 0.1, y2: 0.9, width: 0.03 }, // Left wall
    { x1: 0.1, y1: 0.9, x2: 0.8, y2: 0.9, width: 0.03 }, // Bottom wall
    { x1: 0.8, y1: 0.1, x2: 0.8, y2: 0.5, width: 0.03 }, // Right wall top
    { x1: 0.8, y1: 0.7, x2: 0.8, y2: 0.9, width: 0.03 }, // Right wall bottom
    { x1: 0.3, y1: 0.3, x2: 0.7, y2: 0.3, width: 0.03 }, // Inner obstacle
    { x1: 0.5, y1: 0.3, x2: 0.5, y2: 0.7, width: 0.03 }, // Inner obstacle
  ];

  // Effect to draw the SLAM map on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw known obstacles
    ctx.strokeStyle = '#2d3748';
    obstacles.forEach(obstacle => {
      ctx.lineWidth = obstacle.width * width;
      ctx.beginPath();
      ctx.moveTo(obstacle.x1 * width, obstacle.y1 * height);
      ctx.lineTo(obstacle.x2 * width, obstacle.y2 * height);
      ctx.stroke();
    });
    
    // Draw unexplored areas (random noise pattern for placeholder)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 10 + 5;
      
      // Check if this area is near a known obstacle
      const isNearObstacle = obstacles.some(obs => {
        const dist = Math.min(
          distToSegment({x, y}, 
                       {x: obs.x1 * width, y: obs.y1 * height}, 
                       {x: obs.x2 * width, y: obs.y2 * height}));
        return dist < obs.width * width * 3;
      });
      
      if (!isNearObstacle) {
        ctx.fillRect(x, y, size, size);
      }
    }
    
    // Draw robot position
    const robotX = robotPosition.x * width;
    const robotY = robotPosition.y * height;
    
    // Robot body
    ctx.fillStyle = '#4299e1';
    ctx.beginPath();
    ctx.arc(robotX, robotY, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Robot direction indicator
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(robotX + 5, robotY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
  }, [robotPosition]);
  
  // Simulate robot movement for the placeholder
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setRobotPosition(prev => {
        // Add slight random movement to simulate robot position updates
        const noise = 0.01;
        
        // Stay within bounds
        let newX = prev.x + (Math.random() - 0.5) * noise;
        let newY = prev.y + (Math.random() - 0.5) * noise;
        
        newX = Math.max(0.1, Math.min(0.9, newX));
        newY = Math.max(0.1, Math.min(0.9, newY));
        
        // Check if new position collides with obstacles
        const collides = obstacles.some(obs => {
          const dist = distToSegment(
            {x: newX * canvasRef.current.width, y: newY * canvasRef.current.height},
            {x: obs.x1 * canvasRef.current.width, y: obs.y1 * canvasRef.current.height}, 
            {x: obs.x2 * canvasRef.current.width, y: obs.y2 * canvasRef.current.height}
          );
          return dist < (obs.width * canvasRef.current.width) + 10; // Robot radius = 10
        });
        
        return collides ? prev : { x: newX, y: newY };
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isConnected, obstacles]);
  
  // Helper function to calculate distance from a point to a line segment
  function distToSegment(p, v, w) {
    const l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    return Math.sqrt(dist2(p, { 
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y)
    }));
  }
  
  function dist2(v, w) {
    return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white p-4 rounded-lg shadow ${expanded ? 'fixed inset-4 z-50' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FontAwesomeIcon 
            icon={faRobot} 
            className="mr-2 text-blue-500" 
          />
          SLAM Map
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <FontAwesomeIcon
            icon={expanded ? faCompress : faExpand}
            className="text-sm"
          />
        </button>
      </div>
      
      <div className={`relative ${!isConnected ? 'opacity-50' : ''}`}>
        <canvas
          ref={canvasRef}
          width={expanded ? 800 : 400}
          height={expanded ? 800 : 400}
          className="border border-gray-200 rounded w-full"
        />
        
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-60 rounded">
            <div className="text-center p-4">
              <p className="text-gray-600 font-medium">Robot not connected</p>
              <p className="text-gray-500 text-sm mt-1">SLAM mapping unavailable</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p className="flex justify-between">
          <span>Resolution: 20cm/grid</span>
          <span>Map Age: {isConnected ? '3s' : 'N/A'}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default SlamMap;
