/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['"Raleway"', "sans-serif"],
        arima: ["Arima Madurai", "cursive"],
        anonymous: ["Anonymous Pro", "monospace"],
        cinzel: ["Cinzel", "serif"],
        mplus: ["'M PLUS 1p'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
