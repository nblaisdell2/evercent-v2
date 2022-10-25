/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['"Raleway"', "sans-serif"],
        arima: ["Arima Madurai", "cursive"],
        anonymous: ["Anonymous Pro", "monospace"],
        cinzel: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};
