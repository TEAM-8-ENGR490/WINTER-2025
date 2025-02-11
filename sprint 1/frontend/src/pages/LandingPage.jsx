/**
 * LandingPage.jsx
 * Brute force frame sending with YOLO detection
 * while preserving your charts & item tracking logic.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSync,
  faImage,
  faPlay,
  faPause,
  faSpinner,
  faChartLine,
  faChartPie,
  faList,
  faBoxOpen,
  faPercent,
  faMapMarkerAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

// -- Import the new components we created --
import Header from "../components/Header";
import LiveVideoFeed from "../components/LiveVideoFeed";
import StatsAndCharts from "../components/StatsAndCharts";
import DetectionDetails from "../components/DetectionDetails";
import ItemTypeDetails from "../components/ItemTypeDetails";
import DashboardFooter from "../components/DashboardFooter";

// Add icons to the library (locally, as your snippet does).
library.add(
  faTrash,
  faSync,
  faImage,
  faPlay,
  faPause,
  faSpinner,
  faChartLine,
  faChartPie,
  faList,
  faBoxOpen,
  faPercent,
  faMapMarkerAlt,
  faClipboardList
);

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LandingPage = () => {
  // ------------------------------------------------
  // State Management
  // ------------------------------------------------
  const [imageSrc, setImageSrc] = useState(null);      // The image from the server
  const [detections, setDetections] = useState([]);    // Current detections array

  // For charts
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [itemTypeTimes, setItemTypeTimes] = useState({});
  const [itemTypePercentages, setItemTypePercentages] = useState({});

  // Pause/Resume video feed
  const [isPaused, setIsPaused] = useState(false);

  // Ref to hidden <video> element
  const videoRef = useRef(null);

  // ------------------------------------------------
  // Load persisted data from localStorage on mount
  // ------------------------------------------------
  useEffect(() => {
    const existingDetectionHistory =
      JSON.parse(localStorage.getItem("detectionHistory")) || [];
    setDetectionHistory(existingDetectionHistory);

    const existingItemTypeTimes =
      JSON.parse(localStorage.getItem("itemTypeTimes")) || {};
    setItemTypeTimes(existingItemTypeTimes);
  }, []);

  // ------------------------------------------------
  // Recalculate itemTypePercentages whenever itemTypeTimes changes
  // ------------------------------------------------
  useEffect(() => {
    const total = Object.values(itemTypeTimes).reduce((acc, val) => acc + val, 0);
    if (total === 0) {
      setItemTypePercentages({});
      return;
    }
    const percentages = Object.fromEntries(
      Object.entries(itemTypeTimes).map(([key, value]) => [
        key,
        ((value / total) * 100).toFixed(2),
      ])
    );
    setItemTypePercentages(percentages);
  }, [itemTypeTimes]);

  // ------------------------------------------------
  // WebSocket & Webcam Access
  // Brute force approach: set up once, send frames every 100ms
  // ------------------------------------------------
  useEffect(() => {
    // 1) Open the WebSocket connection
    const ws = new WebSocket("ws://127.0.0.1:49078/ws");

    // 2) Request webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((error) => console.error("Error accessing webcam:", error));

    // 3) Send frames to server (every 100ms) unless paused
    const sendFrame = () => {
      if (!videoRef.current || isPaused) return;
      if (ws.readyState !== WebSocket.OPEN) return;

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg");
      ws.send(imageData);
    };

    const intervalId = setInterval(sendFrame, 100);

    // 4) On receiving data from server
    ws.onmessage = (event) => {
      if (isPaused) return; // Ignore if paused
      try {
        const data = JSON.parse(event.data);

        // a) Annotated image
        setImageSrc(data.image);

        // b) Current detections
        setDetections(data.detections);

        // c) Detection history (append new point)
        setDetectionHistory((prev) => {
          const updated = [
            ...prev,
            { timestamp: Date.now(), detections: data.detections.length },
          ];
          localStorage.setItem("detectionHistory", JSON.stringify(updated));
          return updated;
        });

        // d) Item type times
        setItemTypeTimes((prev) => {
          const updated = { ...prev };
          for (const [itemType, duration] of Object.entries(data.time_on_screen)) {
            updated[itemType] = (updated[itemType] || 0) + duration;
          }
          localStorage.setItem("itemTypeTimes", JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error("Error parsing server message:", err);
      }
    };

    // 5) Handle close/error
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      clearInterval(intervalId);
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);

    // 6) Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      ws.close();
    };
  }, [isPaused]); 
  // ^ We only re-run the effect if isPaused changes
  // (so it can stop sending frames, or resume the interval).

  // ------------------------------------------------
  // Chart Data
  // ------------------------------------------------

  // A) Line Chart: Average Detections
  const lineChartData = {
    labels: detectionHistory.map((entry) =>
      new Date(entry.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Average Detections",
        data: detectionHistory.map((entry, index, arr) => {
          // Rolling average of last 5 points
          const slice = arr.slice(Math.max(index - 4, 0), index + 1);
          const avg = slice.reduce((sum, e) => sum + e.detections, 0) / slice.length;
          return avg;
        }),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)", // Aqua
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // B) Doughnut Chart: Time on Screen per Item Type
  const doughnutChartData = {
    labels: Object.keys(itemTypeTimes),
    datasets: [
      {
        label: "Item Types",
        data: Object.values(itemTypeTimes),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)", // Red
          "rgba(54, 162, 235, 0.6)", // Blue
          "rgba(255, 206, 86, 0.6)", // Yellow
          "rgba(75, 192, 192, 0.6)", // Aqua
          "rgba(153, 102, 255, 0.6)", // Purple
          "rgba(255, 159, 64, 0.6)",  // Orange
          "rgba(201, 203, 207, 0.6)", // Grey
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // ------------------------------------------------
  // Handlers / Helpers
  // ------------------------------------------------
  const handleRefresh = () => {
    localStorage.removeItem("detectionHistory");
    localStorage.removeItem("itemTypeTimes");
    setDetectionHistory([]);
    setItemTypeTimes({});
    setDetections([]);
    setImageSrc(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}m ${secs}s`;
  };

  // The top/first detection
  const currentTarget = detections.length > 0 ? detections[0] : null;

  // ------------------------------------------------
  // Render
  // ------------------------------------------------
  return (
    <div className="min-h-screen bg-green-50 p-2 sm:p-4 lg:p-6 flex flex-col items-center">
      {/* Dashboard Header */}
      <Header handleRefresh={handleRefresh} />

      {/* Subtitle with motion fade-in */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-sm sm:text-base text-green-600 text-center mb-2 sm:mb-4"
      >
        Real-time YOLOv8-powered Detection and Classification
      </motion.p>

      {/* Main Content Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
        {/* Live Video Feed (left side on large screens, top on mobile) */}
        <LiveVideoFeed
          imageSrc={imageSrc}
          isPaused={isPaused}
          togglePause={() => setIsPaused((prev) => !prev)}
          videoRef={videoRef}
        />

        {/* Stats and Charts (right side on large, bottom on mobile) */}
        <StatsAndCharts
          detections={detections}
          currentTarget={currentTarget}
          lineChartData={lineChartData}
          doughnutChartData={doughnutChartData}
          itemTypePercentages={itemTypePercentages}
          formatTime={formatTime}
        />
      </div>

      {/* Detections & Item Type Details */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4">
        <DetectionDetails detections={detections} />
        <ItemTypeDetails
          itemTypeTimes={itemTypeTimes}
          itemTypePercentages={itemTypePercentages}
          formatTime={formatTime}
        />
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default LandingPage;
