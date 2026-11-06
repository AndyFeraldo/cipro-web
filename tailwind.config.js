/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial (archivo madre CIPRO): #FF5117 · #FE6F06 · #FD8A55 · #F4A487 · #FECAA3 + negro/blanco
        brand: { DEFAULT: '#FF5117', 50: '#FFF5F0', 100: '#FFE6DA', 200: '#FECAA3', 300: '#F4A487', 400: '#FD8A55', 500: '#FF5117', 600: '#E8420C', 700: '#BF350A', 800: '#8F290B', 900: '#5C1B08' },
        seg: { 1: '#FF5117', 2: '#FE6F06', 3: '#FD8A55', 4: '#F4A487', 5: '#FECAA3' },
        peach: '#FECAA3',
        cream: '#FFF3EC',
        ink: '#0B0B0B',
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        wave: { '0%,100%': { transform: 'rotate(0deg)' }, '50%': { transform: 'rotate(14deg)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        twinkle: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '.35', transform: 'scale(.7)' } },
        spinslow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: { float: 'float 5s ease-in-out infinite', wave: 'wave 1.6s ease-in-out infinite', marquee: 'marquee 28s linear infinite', twinkle: 'twinkle 2.6s ease-in-out infinite', spinslow: 'spinslow 40s linear infinite' },
    },
  },
  plugins: [],
};
