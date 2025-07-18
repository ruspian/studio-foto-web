// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ... path ke file-file Anda
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"), // <<< PASTIKAN BARIS INI ADA
  ],
};
