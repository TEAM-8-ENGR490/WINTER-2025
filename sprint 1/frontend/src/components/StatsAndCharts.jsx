/**
 * StatsAndCharts.jsx
 * - Combines: Total Detections, Current Target, Line Chart, and Doughnut Chart.
 * - This replicates the "Statistics and Charts" section from your snippet.
 */

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faClipboardList, faChartLine, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { Line, Doughnut } from "react-chartjs-2";

const StatsAndCharts = ({
  detections,
  currentTarget,
  lineChartData,
  doughnutChartData,
  itemTypePercentages,
  formatTime
}) => {
  return (
    /**
     * Container: Divided into 2 columns on sm+ screens, 1 column on mobile.
     * - gap-2 sm:gap-4: Spacing between grid items.
     */
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      {/* 1) Total Detections */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center"
      >
        <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
          <FontAwesomeIcon icon={faTrash} className="mr-0.5 text-sm" />
          Total Detections
        </h2>
        <p className="text-2xl font-bold text-green-700">{detections.length}</p>
      </motion.div>

      {/* 2) Current Target */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center"
      >
        <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
          <FontAwesomeIcon icon={faClipboardList} className="mr-0.5 text-sm" />
          Current Target
        </h2>
        {currentTarget ? (
          <div className="text-center">
            <p className="text-lg font-medium text-green-700">{currentTarget.class}</p>
            <p className="text-sm text-green-600">
              Confidence: {(currentTarget.confidence * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-green-600">
              Coordinates: [
              {Math.round(currentTarget.coordinates[0])},
              {Math.round(currentTarget.coordinates[1])}] - [
              {Math.round(currentTarget.coordinates[2])},
              {Math.round(currentTarget.coordinates[3])}]
            </p>
          </div>
        ) : (
          <p className="text-sm text-green-400">No current target available.</p>
        )}
      </motion.div>

      {/* 3) Line Chart - Average Detections */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col"
      >
        <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-0.5 text-sm" />
          Avg Detections Over Time
        </h2>
        <div className="h-32 sm:h-40">
          {/**
           * Using <Line> from react-chartjs-2 to display lineChartData.
           * Options set to tailor colors, fonts, grid lines, and tooltips.
           */}
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: "#34D399",
                    font: { size: 8 },
                  },
                },
                tooltip: {
                  bodyFont: { size: 8 },
                  titleFont: { size: 10 },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: "#4ade80",
                    font: { size: 8 },
                  },
                  grid: {
                    color: "rgba(34, 197, 94, 0.1)",
                  },
                },
                y: {
                  ticks: {
                    color: "#4ade80",
                    font: { size: 8 },
                  },
                  grid: {
                    color: "rgba(34, 197, 94, 0.1)",
                  },
                },
              },
            }}
            height={100}
          />
        </div>
      </motion.div>

      {/* 4) Doughnut Chart - Detected Item Types */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col"
      >
        <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
          <FontAwesomeIcon icon={faChartPie} className="mr-0.5 text-sm" />
          Detected Item Types
        </h2>
        <div className="h-32 sm:h-40">
          <Doughnut
            data={doughnutChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: "#34D399",
                    font: { size: 8 },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      const percentage = itemTypePercentages[label] || 0;
                      return `${label}: ${formatTime(value)} (${percentage}%)`;
                    },
                  },
                  bodyFont: { size: 8 },
                  titleFont: { size: 10 },
                },
              },
            }}
            height={100}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default StatsAndCharts;

/**
 * Tailwind Docs Reference:
 * - Grid Layout: https://tailwindcss.com/docs/grid-template-columns
 * - Spacing (gap): https://tailwindcss.com/docs/gap
 * - Sizing (width/height): https://tailwindcss.com/docs/width
 */
