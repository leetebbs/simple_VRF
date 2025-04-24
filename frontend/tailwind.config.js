/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fd',
          100: '#dfe7fa',
          200: '#c7d3f5',
          300: '#a5b8ed',
          400: '#8096e2',
          500: '#6374d6',
          600: '#4e58c7',
          700: '#4347af',
          800: '#0A192F', // Main background
          900: '#06101E',
          950: '#030912',
        },
        teal: {
          400: '#64FFDA',
          500: '#41E5C0',
          600: '#28C0A5',
        },
        slate: {
          200: '#CCD6F6',
          300: '#A8B2D1',
          400: '#8892B0',
          500: '#64748B',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'height': 'height',
      },
    },
  },
  plugins: [],
};