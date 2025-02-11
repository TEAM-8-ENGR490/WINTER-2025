import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 3000, // Development server port
    open: true, // Automatically open the app in the browser
  },
  build: {
    outDir: "dist", // Output directory for the build
  },
  resolve: {
    alias: {
      "@": "/src", // Optional: cleaner import paths
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"], // Pre-bundle dependencies for faster development
  },
});
