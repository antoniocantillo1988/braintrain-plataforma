/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Paleta de marca */
        salvia: {
          50: '#EADFCB',
          100: '#E3D6BE',
          200: '#DDBF88',
          300: '#DDBF88',
          400: '#DDBF88',
          500: '#5E8C7B',
          600: '#5E8C7B',
          700: '#4E7466',
          800: '#43614F',
        },
        terracota: {
          50: '#F7EAE4',
          100: '#F0DCD2',
          500: '#CB745A',
          600: '#B9654B',
          700: '#A2553F',
        },
        arena: {
          50: '#F7F1E4',
          100: '#DDBF88',
          200: '#DDBF88',
          300: '#DDBF88',
        },
        crema: {
          50: '#EADFCB',
          100: '#EADFCB',
          200: '#EADFCB',
        },
        /* La escala teal se reasigna a la paleta de marca para
           que todos los componentes existentes usen los nuevos colores */
        teal: {
          50: '#EADFCB',
          100: '#E3D6BE',
          200: '#DDBF88',
          300: '#DDBF88',
          400: '#DDBF88',
          500: '#5E8C7B',
          600: '#5E8C7B',
          700: '#4E7466',
          800: '#43614F',
        },
      },
    },
  },
  plugins: [],
};
