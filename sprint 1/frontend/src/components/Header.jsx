/**
 * Header.jsx
 * - Displays the top section with the dashboard title and refresh button.
 * - Adds line-by-line comments explaining logic & Tailwind classes.
 */

import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

const Header = ({ handleRefresh }) => {
  return (
    /**
     * The main header container.
     * - w-full, max-w-6xl: Make it full width but cap at 6xl (1280px).
     * - mb-2 sm:mb-4: Margin bottom for spacing.
     * - flex-col sm:flex-row: Column layout on mobile, row on small+ screens.
     * - justify-between, items-center: Distribute space and align items.
     */
    <header className="w-full max-w-6xl mb-2 sm:mb-4 flex flex-col sm:flex-row justify-between items-center">
      {/* The title area; uses Framer Motion for a slight fade/slide-in effect. */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      >
        {/* Text-2xl sm:text-3xl sets responsive text size. */}
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center">
          Team 8-490 Trash Inference Dashboard
        </h1>
      </motion.div>

      {/* The refresh button container with a slight fade/slide from right. */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-1 sm:mt-0"
      >
        {/**
         * The refresh button:
         * - px-2 sm:px-3, py-1 sm:py-1.5: Responsive padding.
         * - bg-blue-500 hover:bg-blue-600: Button background color with hover effect.
         * - text-white: White text.
         * - font-bold, rounded-lg: Bold text, rounded corners.
         * - flex items-center: Keep icon and text aligned horizontally.
         * - text-xs sm:text-sm: Smaller font for mobile, slightly bigger on sm+.
         */}
        <button
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg flex items-center transition-colors duration-300 text-xs sm:text-sm"
          onClick={handleRefresh}
        >
          <FontAwesomeIcon icon={faSync} className="mr-1 text-sm" />
          Refresh
        </button>
      </motion.div>
    </header>
  );
};

export default Header;

/**
 * Tailwind Docs Reference:
 * - Flexbox & Grid: https://tailwindcss.com/docs/flex
 * - Spacing: https://tailwindcss.com/docs/spacing
 * - Typography: https://tailwindcss.com/docs/font-size
 * - Colors: https://tailwindcss.com/docs/customizing-colors
 */
