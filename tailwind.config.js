/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F2937",
        secondary: "#111827",
        dark: "#030712",
        light: "#9CA3AF",
        accent: "#3B82F6"
      },
      animation: {
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        glow: {
          'from': {
            textShadow: '0 0 4px #fff, 0 0 8px #fff, 0 0 12px #e60073',
          },
          'to': {
            textShadow: '0 0 2px #fff, 0 0 4px #ff4da6, 0 0 6px #ff4da6',
          },
        },
      }
    },
  },
  plugins: [],
} 