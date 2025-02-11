/**
 * DashboardFooter.jsx
 * - Displays the footer text as in your snippet with a fade-in motion.
 */

import React from "react";
import { motion } from "framer-motion";

const DashboardFooter = () => {
  return (
    /**
     * Footer container:
     * - w-full, max-w-6xl: Keep consistent width with the header.
     * - mt-2 sm:mt-4: Vertical spacing from the main content.
     * - text-center: Center the text.
     * - text-green-500: Text color.
     * - text-xs sm:text-sm: Responsive text sizing.
     */
    <motion.footer
      className="w-full max-w-6xl mt-2 sm:mt-4 text-center text-green-500 text-xs sm:text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      &copy; {new Date().getFullYear()} Green Guardian.
    </motion.footer>
  );
};

export default DashboardFooter;
