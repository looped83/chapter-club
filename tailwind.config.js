/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f5ddb0',
          300: '#edc57e',
          400: '#e4a84a',
          500: '#dc8f28',
          600: '#cd751d',
          700: '#aa5a19',
          800: '#89481b',
          900: '#703c19',
          950: '#3d1e0a',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'focus-brand':      '0 0 0 3px rgba(228,168,74,0.22), 0 0 14px rgba(228,168,74,0.14)',
        'focus-brand-dark': '0 0 0 3px rgba(228,168,74,0.32), 0 0 18px rgba(228,168,74,0.20)',
        'focus-red':        '0 0 0 3px rgba(239,68,68,0.22),  0 0 14px rgba(239,68,68,0.14)',
        'focus-red-dark':   '0 0 0 3px rgba(239,68,68,0.32),  0 0 18px rgba(239,68,68,0.20)',
      },
    },
  },
  plugins: [],
}
