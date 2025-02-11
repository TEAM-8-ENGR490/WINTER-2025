/**
 * DetectionDetails.jsx
 * - Renders the table of Detections Details from your snippet.
 */

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faBoxOpen,
  faPercent,
  faMapMarkerAlt,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

const DetectionDetails = ({ detections }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col"
    >
      {/**
       * Section title: "Detections Details"
       * - text-sm sm:text-base: Responsive text sizing
       * - text-green-600: Green text color
       */}
      <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
        <FontAwesomeIcon icon={faList} className="mr-0.5 text-sm" />
        Detections Details
      </h2>

      {/* If we have detections, render the table, else show a "No detections available" message. */}
      {detections.length > 0 ? (
        <div className="overflow-x-auto">
          {/**
           * Tailwind table styling:
           * - min-w-full ensures the table takes up full width
           * - text-xs sm:text-sm for responsive font sizes
           */}
          <table className="min-w-full bg-white text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-1 text-xs" />
                  Class
                </th>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faPercent} className="mr-1 text-xs" />
                  Confidence
                </th>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-xs" />
                  Coordinates
                </th>
              </tr>
            </thead>
            <tbody>
              {detections.map((det, index) => (
                /**
                 * Each table row animated with a slight fade/slide-in effect
                 * by incrementing the delay based on the index.
                 */
                <motion.tr
                  key={index}
                  className="border-b"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-1 px-2 sm:px-3 text-green-700 flex items-center">
                    <FontAwesomeIcon icon={faTrash} className="mr-0.5 text-xs" />
                    {det.class}
                  </td>
                  <td className="py-1 px-2 sm:px-3 text-green-700">
                    {(det.confidence * 100).toFixed(2)}%
                  </td>
                  <td className="py-1 px-2 sm:px-3 text-green-700 text-[10px] sm:text-xs">
                    [{Math.round(det.coordinates[0])}, {Math.round(det.coordinates[1])}] - [
                    {Math.round(det.coordinates[2])}, {Math.round(det.coordinates[3])}]
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /**
         * No detections fallback:
         * - text-green-400: Subtle color for "No detections available."
         */
        <motion.div
          className="flex items-center justify-center text-center text-green-400 py-6 sm:py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faList} className="mr-1 text-lg sm:text-xl" />
          No detections available.
        </motion.div>
      )}
    </motion.div>
  );
};

export default DetectionDetails;
