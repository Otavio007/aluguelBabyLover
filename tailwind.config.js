/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5E6FF',
          100: '#E9CCFF',
          200: '#D499FF',
          300: '#B866F2',
          400: '#9B33E0',
          500: '#7B00C4',
          600: '#4C007D',
          700: '#3A005E',
          800: '#280040',
          900: '#180028',
          950: '#0C0014',
        },
        accent: {
          50: '#FFF0F7',
          100: '#FFE0F1',
          200: '#FFBFE3',
          300: '#FFA3D5',
          400: '#FF8DC7',
          500: '#FF6CB6',
          600: '#F54BA2',
          700: '#D9308A',
          800: '#B21E72',
          900: '#8A125A',
          950: '#57083A',
        },
        secondary: {
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
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(76, 0, 125, 0.25)',
        card: '0 8px 30px -12px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
