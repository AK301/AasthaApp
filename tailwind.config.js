/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",        // App Router pages/layouts
    "./src/components/**/*.{js,ts,jsx,tsx}", // Your components
    "./src/lib/**/*.{js,ts,jsx,tsx}",        // Optional helpers
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
