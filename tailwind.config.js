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
        spider: {
          void: '#06090e',
          depth: '#090e17',
          surface: '#0d1522',
          card: '#111b2b',
          border: 'rgba(0, 240, 255, 0.14)',
          cyan: '#00f0ff',
          neon: '#38bdf8',
          silk: '#e2f3fc',
          venom: '#10b981',
          toxic: '#22c55e',
          widow: '#ef4444',
          crimson: '#f43f5e',
          purple: '#a855f7',
          violet: '#8b5cf6',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'spider-glow': '0 0 25px -5px rgba(0, 240, 255, 0.25)',
        'venom-glow': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'widow-glow': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
        'purple-glow': '0 0 25px -5px rgba(168, 85, 247, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'silk-float': 'silkFloat 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 16px rgba(0,240,255,0.8))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        silkFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
