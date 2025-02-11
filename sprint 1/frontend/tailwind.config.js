module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all files in the src folder
    "./src/pages/**/*.{js,jsx}", // Include pages folder
    "./src/components/**/*.{js,jsx}", // Include components folder
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Nunito'","'Open Sans'", "sans-serif"], // Add Open Sans as the default sans-serif font
      },
      animation: {
        wave: "wave 25s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
