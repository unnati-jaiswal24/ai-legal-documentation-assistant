/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6C4DFF',
          pink: '#FF4F8B',
          yellow: '#FFC83D',
          mint: '#2ED8A3',
          blue: '#3CB8FF',
          orange: '#FF8A3D',
          dark: '#14122B',
          darkbg: '#0F0C20',
          lightbg: '#FAF9FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}