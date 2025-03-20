// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Import Tailwind CSS
import "@fontsource/nunito"; // Defaults to weight 400
import "@fontsource/open-sans";

// Remove StrictMode for debugging
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
