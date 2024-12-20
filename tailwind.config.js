/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Rich blue
          dark: '#1d4ed8',
          light: '#60a5fa'
        },
        secondary: {
          DEFAULT: '#0f172a', // Dark blue/slate
          dark: '#020617',
          light: '#334155'
        },
        success: {
          DEFAULT: '#16a34a',
          dark: '#15803d',
          light: '#22c55e'
        },
        warning: {
          DEFAULT: '#ca8a04',
          dark: '#a16207',
          light: '#eab308'
        },
        danger: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#ef4444'
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
