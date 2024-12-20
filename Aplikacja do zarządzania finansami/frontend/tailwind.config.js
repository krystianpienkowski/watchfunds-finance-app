/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        szary: '#F4F4F4',
        niebieski: '#3A408F',
        szaroniebieski: '#979AC2',

      },
    },    
  },
  plugins: [],
}

