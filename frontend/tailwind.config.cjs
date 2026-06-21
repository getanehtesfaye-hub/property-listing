/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f6fc',
          100: '#e8ecf7',
          200: '#cbd5ee',
          300: '#9fb4e1',
          400: '#6d8cd0',
          500: '#486cb8',
          600: '#385399',
          700: '#2f437c',
          800: '#2a3a69',
          900: '#253259',
          950: '#1a223f',
        },
      },
    },
  },
  plugins: [],
}
