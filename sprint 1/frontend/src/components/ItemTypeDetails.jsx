/**
 * ItemTypeDetails.jsx
 * - Renders a table with item types, time on screen, and percentage from your snippet.
 */

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faBoxOpen,
  faMapMarkerAlt,
  faPercent,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

const ItemTypeDetails = ({ itemTypeTimes, itemTypePercentages, formatTime }) => {
  const itemTypes = Object.keys(itemTypeTimes);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col"
    >
      <h2 className="text-sm sm:text-base font-semibold text-green-600 mb-1 flex items-center">
        <FontAwesomeIcon icon={faChartPie} className="mr-0.5 text-sm" />
        Item Type Details
      </h2>
      {itemTypes.length > 0 ? (
        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <table className="min-w-full bg-white text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-1 text-xs" />
                  Item Type
                </th>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-xs" />
                  Time on Screen (s)
                </th>
                <th className="py-1 px-2 sm:px-3 bg-green-200 text-left font-semibold text-green-700">
                  <FontAwesomeIcon icon={faPercent} className="mr-1 text-xs" />
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {itemTypes.map((type, index) => (
                <motion.tr
                  key={type}
                  className="border-b"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <td className="py-1 px-2 sm:px-3 text-green-700 flex items-center">
                    <FontAwesomeIcon icon={faTrash} className="mr-0.5 text-xs" />
                    {type}
                  </td>
                  <td className="py-1 px-2 sm:px-3 text-green-700">
                    {formatTime(itemTypeTimes[type])}
                  </td>
                  <td className="py-1 px-2 sm:px-3 text-green-700">
                    {itemTypePercentages[type]}%
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div
          className="flex items-center justify-center text-center text-green-400 py-6 sm:py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faChartPie} className="mr-1 text-lg sm:text-xl" />
          No item type data available.
        </motion.div>
      )}
    </motion.div>
  );
};

export default ItemTypeDetails;

/**
 * Tailwind Docs Reference:
 * - Table Layout: https://tailwindcss.com/docs/table-layout
 * - Overflow & Scrolling: https://tailwindcss.com/docs/overflow
 */
