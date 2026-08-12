/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#0A192F',
          gold: '#FFD700',
          light: '#F5F7FA',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(10, 25, 47, 0.12)',
      },
    },
  },
  plugins: [],
};
