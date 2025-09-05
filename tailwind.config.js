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
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8cd18c',
          400: '#5bb55b',
          500: '#2D5016',
          600: '#246412',
          700: '#1f530f',
          800: '#1c420e',
          900: '#1a370d',
        },
        secondary: {
          50: '#f7fdf2',
          100: '#edf9e3',
          200: '#d8f2c9',
          300: '#b8e6a1',
          400: '#7CB342',
          500: '#66a531',
          600: '#4f8125',
          700: '#3f6520',
          800: '#35521d',
          900: '#2e451c',
        },
        accent: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba74',
          400: '#FFA726',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: '#FFFFFF',
        background: '#F5F7F0',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}