/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3B82F6', // Современный синий
        'secondary-green': '#10B981', // Зеленый
        'accent-red': '#EF4444', // Красный
        'accent-yellow': '#F59E0B', // Желтый
        'dark-bg': '#1F2937', // Темный фон
        'dark-text': '#D1D5DB', // Светлый текст в темной теме
        'glass-bg': 'rgba(255, 255, 255, 0.1)', // Полупрозрачный фон для эффекта стекла
      },
      fontFamily: {
        'display': ['"Inter", sans-serif'], // Современный шрифт
      },
      boxShadow: {
        'custom': '0 4px 20px rgba(0, 0, 0, 0.1)', // Мягкая тень
        'custom-dark': '0 4px 20px rgba(0, 0, 0, 0.3)', // Тень в темной теме
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)', // Градиент для фона
      },
    },
  },
  darkMode: 'class', // Включаем поддержку темной темы
  plugins: [],
};