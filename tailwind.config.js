/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#F26B1D', 50: '#FFF4EC', 100: '#FFE4D1', 200: '#FFC9A3', 300: '#FFA86E', 400: '#FA8840', 500: '#F26B1D', 600: '#D95510', 700: '#B3420E', 800: '#8C3512', 900: '#5E2410' },
        peach: '#FFD9BF',
        ink: '#111111',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        wave: { '0%,100%': { transform: 'rotate(0deg)' }, '50%': { transform: 'rotate(14deg)' } },
      },
      animation: { float: 'float 5s ease-in-out infinite', wave: 'wave 1.6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
