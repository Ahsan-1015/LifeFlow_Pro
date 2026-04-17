/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce2ff",
          300: "#8fd1ff",
          400: "#59b7ff",
          500: "#2c98f0",
          600: "#1678ce",
          700: "#1560a7",
          800: "#174f88",
          900: "#194372",
        },
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glass: "0 18px 45px rgba(15, 23, 42, 0.15)",
      },
      backgroundImage: {
        glow: "radial-gradient(circle at top left, rgba(44, 152, 240, 0.28), transparent 35%), radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.2), transparent 30%)",
      },
    },
  },
  plugins: [],
};
