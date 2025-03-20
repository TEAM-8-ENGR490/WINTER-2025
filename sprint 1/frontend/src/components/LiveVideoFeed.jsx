import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faSpinner } from "@fortawesome/free-solid-svg-icons";

const LiveVideoFeed = ({ imageSrc, isPaused, togglePause }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow"
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Live Video Feed</h2>
        <button
          onClick={togglePause}
          className={`p-2 rounded-full ${
            isPaused ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          } text-white transition-colors`}
        >
          <FontAwesomeIcon
            icon={isPaused ? faPlay : faPause}
            className="text-sm"
          />
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {imageSrc ? (
          <motion.img
            key="image"
            src={imageSrc}
            alt="Live video feed"
            className="rounded-lg border-1 border-green-300 w-full h-auto object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.div
            key="spinner"
            className="flex items-center justify-center text-center text-green-400 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <FontAwesomeIcon icon={faSpinner} spin className="mr-1 text-lg" />
            Waiting for live video feed...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveVideoFeed;
