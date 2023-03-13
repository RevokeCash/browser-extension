/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        30: '7.5rem',
        92: '23rem',
        104: '26rem',
      },
    },
  },
  plugins: [],
};
