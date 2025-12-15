/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#fff8f3',
          300: '#ffdab9',
          500: '#ff7a00',
          700: '#b05500',
        },
      },
    },
  },
  plugins: [],
}
