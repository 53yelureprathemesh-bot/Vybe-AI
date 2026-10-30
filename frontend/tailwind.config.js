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
        vybe: {
          navy: '#14213D',
          'navy-light': '#1E2F54',
          teal: '#14B8A6',
          'teal-dark': '#0D9488',
          'teal-light': '#2DD4BF',
          mint: '#DDF7EE',
          'mint-dark': '#B8EEDC',
          warm: '#F8FAFC',
          slate: '#64748B',
          'slate-light': '#94A3B8',
          'slate-dark': '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
