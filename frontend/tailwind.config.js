/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#7d8cff',
          500: '#667eea',
          600: '#5a6fda',
          700: '#764ba2',
        },
      },
      boxShadow: {
        glass: '0 12px 30px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        brand: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
}

