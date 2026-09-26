/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#070b14',
          card: '#0e172a',
          cardHover: '#131f3d',
          border: '#1e293b',
          blue: '#0047ba',
          royal: '#025ce2',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          accent: '#3b82f6',
          gold: '#f59e0b',
          emerald: '#10b981',
          crimson: '#ef4444'
        }
      },
      fontFamily: {
        arabic: ['"Tajawal"', '"Cairo"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-blue': 'glowBlue 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glowBlue: {
          '0%': { boxShadow: '0 0 15px rgba(2, 92, 226, 0.35)' },
          '100%': { boxShadow: '0 0 35px rgba(6, 182, 212, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
