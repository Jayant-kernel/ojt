/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Helvetica"', '"Arial"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Helvetica"', '"Arial"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0B0B11', // Very dark background
          900: '#111218', // Sidebar / Top bar
          800: '#161720', // Cards
          700: '#1E1F29', // Card hover / borders
          600: '#2A2C3A',
          500: '#3D4155',
        },
        primary: {
          500: '#A955FF', // Magenta/Purple accent
          400: '#B872FF',
          600: '#913DED',
        },
        secondary: {
          500: '#3A2E70', // Darker purple highlight
        },
        steel: {
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
        },
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}
