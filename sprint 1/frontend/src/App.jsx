import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faWifi, 
  faCircleXmark,
  faPlug, 
  faUnlink, 
  faSpinner, 
  faExclamationTriangle,
  faPlay,
  faPause,
  faRobot,
  faGamepad,
  faVideo,
  faChartLine,
  faInfoCircle,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faCircle,
  faStop,
  faCog,
  faLightbulb,
  faMicrochip,
  faBan,
  faSyncAlt,
  faSearch,
  faHome,
  faVolumeUp,
  faRuler,
  faThermometerHalf,
  faBatteryThreeQuarters,
  faBug, // Add this for debug mode
  faRotateLeft,
  faRotateRight,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';

import RemoteControl from './pages/RemoteControl';
import LandingPage from './pages/LandingPage';
import TelemetryDashboard from './pages/TelemetryDashboard';

// Add all the icons to the library
library.add(
  faWifi, 
  faCircleXmark,
  faPlug, 
  faUnlink, 
  faSpinner, 
  faExclamationTriangle,
  faPlay,
  faPause,
  faRobot,
  faGamepad,
  faVideo,
  faChartLine,
  faInfoCircle,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faCircle,
  faStop,
  faCog,
  faLightbulb,
  faMicrochip,
  faBan,
  faSyncAlt,
  faSearch,
  faHome,
  faVolumeUp,
  faRuler,
  faThermometerHalf,
  faBatteryThreeQuarters,
  faBug, // Add this for debug mode
  faRotateLeft,
  faRotateRight,
  faExpand,
  faCompress
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Make RemoteControl the default landing page */}
        <Route path="/" element={<RemoteControl />} />
        <Route path="/detection" element={<LandingPage />} />
        <Route path="/telemetry" element={<TelemetryDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;