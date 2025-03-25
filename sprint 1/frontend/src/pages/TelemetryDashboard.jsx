import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBatteryHalf,
  faThermometerHalf,
  faMicrochip,
  faMemory,
  faNetworkWired,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Import telemetry components
import BatteryStatus from "../components/telemetry/BatteryStatus";
import CpuStatus from "../components/telemetry/CpuStatus";
import TemperatureStatus from "../components/telemetry/TemperatureStatus";
import MemoryStatus from "../components/telemetry/MemoryStatus";
import SensorStatus from "../components/telemetry/SensorStatus";
import NetworkStatus from "../components/telemetry/NetworkStatus";

// Add icons to the library
library.add(
  faBatteryHalf,
  faThermometerHalf,
  faMicrochip,
  faMemory,
  faNetworkWired,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
  faHome
);

const TelemetryDashboard = () => {
  // State for telemetry data
  const [cpuData, setCpuData] = useState({ usage: 0, temperature: 0, frequency: 0 });
  const [memoryData, setMemoryData] = useState({ used: 0, total: 0, percentage: 0 });
  const [networkData, setNetworkData] = useState({ status: "disconnected", type: "ethernet" });
  const [sensorStatus, setSensorStatus] = useState({
    camera: "online",
    lidar: "online",
    ultrasonic: "online"
  });
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState({
    cpu: [],
    memory: [],
    temperature: []
  });
  const [isSimulated, setIsSimulated] = useState(true);

  // Connect to WebSocket for telemetry data
  useEffect(() => {
    console.log("Attempting to connect to telemetry WebSocket...");
    const PI_ADDRESS = import.meta.env.VITE_PI_ADDRESS || "100.73.143.76";
    const ws = new WebSocket(`ws://${PI_ADDRESS}:49078/telemetry`);

    ws.onopen = () => {
      console.log("Connected to telemetry WebSocket");
      setIsConnected(true);
      
      // We'll set isSimulated based on data received from server
      // For now, assume it's true until we get real data
    };

    ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
      alert("Failed to connect to telemetry. Please check if the backend server is running.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if data is simulated or real
        if (data.isSimulated !== undefined) {
          setIsSimulated(data.isSimulated);
        }
        
        // Update current values
        if (data.cpu) {
          setCpuData(data.cpu);
        }
        if (data.memory) {
          setMemoryData(data.memory);
        }
        if (data.network) {
          setNetworkData(data.network);
        }
        if (data.sensors) {
          setSensorStatus(data.sensors);
        }

        // Update history for charts
        const timestamp = new Date().toLocaleTimeString();
        setTelemetryHistory(prev => ({
          cpu: [...prev.cpu, { timestamp, value: parseFloat((data.cpu?.usage || 0).toFixed(2)) }].slice(-20),
          memory: [...prev.memory, { timestamp, value: parseFloat((data.memory?.percentage || 0).toFixed(2)) }].slice(-20),
          temperature: [...prev.temperature, { timestamp, value: parseFloat((data.cpu?.temperature || 0).toFixed(2)) }].slice(-20)
        }));
      } catch (err) {
        console.error("Error parsing telemetry data:", err);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from telemetry WebSocket");
      setIsConnected(false);
    };

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Prepare chart data
  const cpuChartData = {
    labels: telemetryHistory.cpu.map(item => item.timestamp),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: telemetryHistory.cpu.map(item => item.value),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const temperatureChartData = {
    labels: telemetryHistory.temperature.map(item => item.timestamp),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: telemetryHistory.temperature.map(item => item.value),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const memoryChartData = {
    labels: telemetryHistory.memory.map(item => item.timestamp),
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: telemetryHistory.memory.map(item => item.value),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#4b5563',
          font: { size: 8 },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#4b5563',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#4b5563',
          font: { size: 12 }
        }
      },
      tooltip: {
        bodyFont: { size: 12 },
        titleFont: { size: 14 }
      }
    },
    animation: {
      duration: 300
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6 flex flex-col">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Link to="/" className="text-green-600 hover:text-green-800 transition-colors bg-green-100 px-3 py-2 rounded-lg">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Home
          </Link>
          <Link to="/detection" className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-100 px-3 py-2 rounded-lg">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Detection Dashboard
          </Link>
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Raspberry Pi 4 System Health
          {isSimulated && (
            <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
              SIMULATED DATA
            </span>
          )}
        </h1>
        
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl mx-auto bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <span>
            Not connected to the robot's telemetry system. Showing simulated data for demonstration purposes.
          </span>
        </motion.div>
      )}

      {/* Simulation Warning */}
      {isConnected && isSimulated && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl mx-auto bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <span>
            Connected to server, but showing simulated data as the Raspberry Pi hardware is not detected.
          </span>
        </motion.div>
      )}

      {/* Primary Metrics */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <CpuStatus data={cpuData} />
        <TemperatureStatus temperature={cpuData.temperature} />
        <MemoryStatus data={memoryData} />
      </div>

      {/* Charts */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">CPU History</h2>
          <div className="h-64">
            <Line data={cpuChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Temperature History</h2>
          <div className="h-64">
            <Line data={temperatureChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Memory History</h2>
          <div className="h-64">
            <Line data={memoryChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Sensor Status & Network */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <SensorStatus sensors={sensorStatus} />
        <NetworkStatus data={networkData} />
      </div>
    </div>
  );
};

export default TelemetryDashboard;
