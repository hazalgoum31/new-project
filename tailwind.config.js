/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Reem Kufi"', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      colors: {
        ink: '#10231F',
        pine: { DEFAULT: '#0F6B4A', dark: '#0A4F37', light: '#E3F1EA' },
        flag: '#C8312B',
        brass: '#B58A2B',
        paper: '#F4F6F5',
      },
    },
  },
  plugins: [],
}