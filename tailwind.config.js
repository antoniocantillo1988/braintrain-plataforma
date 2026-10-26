/** @type {import('tailwindcss').Config} */
// Paleta Orienta · Propuesta 4 "Círculo de apoyo"
//   verde salvia #5E8C7B · terracota #CB745A · crema dorado #DDBF88 · crema #EADFCB
const sage = {
  50: '#F1F6F4', 100: '#E0EBE6', 200: '#C2D7CE', 300: '#9DBDB0', 400: '#7BA392',
  500: '#5E8C7B', 600: '#4E7466', 700: '#3F5F54', 800: '#324B43', 900: '#263A34',
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sage,
        // Las clases "teal-*" que ya usa la app pasan automáticamente a verde salvia
        teal: sage,
        terracota: {
          50: '#FBF1ED', 100: '#F6E1DA', 200: '#EDC3B5', 300: '#E19F8A', 400: '#D68870',
          500: '#CB745A', 600: '#B25F46', 700: '#8F4B38',
        },
        oro: {
          50: '#FBF6EC', 100: '#F6EDD9', 200: '#EFDDB9', 300: '#E8D3AA', 400: '#DDBF88',
          500: '#C9A565', 600: '#A9864A',
        },
        crema: {
          50: '#FBF8F2', 100: '#F6EFE5', 200: '#EADFCB', 300: '#DCCDB2',
        },
        tierra: { 700: '#4A3730', 800: '#3B2C27' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        suave: '0 8px 30px -12px rgba(94, 140, 123, 0.35)',
      },
    },
  },
  plugins: [],
};
