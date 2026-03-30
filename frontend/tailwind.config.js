/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#080A0E',
          900: '#0D1117',
          800: '#161B25',
          700: '#1E2533',
          600: '#2A3347',
          500: '#3D4F6B',
        },
        amber: {
          400: '#2596be',
          300: '#36fdc89f',
          500: '#2596be',
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
