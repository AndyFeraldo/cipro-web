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
        blob: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(8%,-10%) scale(1.15)' }, '66%': { transform: 'translate(-10%,8%) scale(.9)' } },
        fadeup: { from: { opacity: '0', transform: 'translateY(18px)', filter: 'blur(8px)' }, to: { opacity: '1', transform: 'none', filter: 'blur(0)' } },
        draw: { from: { strokeDashoffset: '400' }, to: { strokeDashoffset: '0' } },
        pulsering: { '0%': { transform: 'scale(.8)', opacity: '.9' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
        shine: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: { float: 'float 5s ease-in-out infinite', wave: 'wave 1.6s ease-in-out infinite', marquee: 'marquee 28s linear infinite', twinkle: 'twinkle 2.6s ease-in-out infinite', spinslow: 'spinslow 40s linear infinite', blob: 'blob 18s ease-in-out infinite', fadeup: 'fadeup .8s cubic-bezier(.2,.7,.2,1) both', draw: 'draw 3.5s ease-out both', pulsering: 'pulsering 2.4s ease-out infinite', shine: 'shine 6s linear infinite' },
    },
  },
  plugins: [],
};
