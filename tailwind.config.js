/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2fa',
          100: '#fce7f7',
          200: '#fad0ef',
          300: '#f7abdf',
          400: '#f083cf',
          500: '#ee76d2',
          600: '#e04fb8',
          700: '#c7359a',
          800: '#a52d7e',
          900: '#88296a',
          950: '#54103f',
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
        soft: '0 4px 24px -4px rgba(238, 118, 210, 0.25)',
        card: '0 8px 30px -12px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
