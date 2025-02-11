import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPlay, faPause, faSpinner } from "@fortawesome/free-solid-svg-icons";

const LiveVideoFeed = ({ imageSrc, isPaused, togglePause, videoRef }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="bg-white shadow-sm rounded-lg p-2 sm:p-3 flex flex-col"
  >
    {/* Top Bar with Title + Pause/Resume Button */}
    <div className="flex items-center justify-between mb-1 sm:mb-2">
      <h2 className="text-lg font-semibold text-green-600 flex items-center">
        <FontAwesomeIcon icon={faImage} className="mr-1 text-md" />
        Live Video Feed
      </h2>
      <button
        className={`px-2 sm:px-3 py-0.5 sm:py-1 text-white font-bold rounded-lg flex items-center transition-colors duration-300 text-xs sm:text-sm ${
          isPaused ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        }`}
        onClick={togglePause}
      >
        <FontAwesomeIcon icon={isPaused ? faPlay : faPause} className="mr-1 text-sm" />
        {isPaused ? "Resume" : "Pause"}
      </button>
    </div>

    {/* Hidden <video> for capturing frames from the webcam */}
    <video
      ref={videoRef}
      style={{ display: "none" }}
      width="640"
      height="480"
    />

    <AnimatePresence>
      {imageSrc ? (
        // If we have an annotated image, show it with a fade-in effect
        <motion.img
          key="live-image"
          src={imageSrc}
          alt="YOLOv8 Output"
          className="rounded-lg border-1 border-green-300 w-full h-auto object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ) : (
        // Otherwise, show a spinner while we wait for server frames
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

export default LiveVideoFeed;
