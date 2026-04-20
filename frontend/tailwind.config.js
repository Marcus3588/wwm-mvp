/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0a0a0a',
          charcoal: '#141414',
          gold: {
            50: '#fdf9ed',
            100: '#f8edcf',
            200: '#f0d89a',
            300: '#e7be64',
            400: '#dfa639',
            500: '#c9942e',
            600: '#a57324',
            700: '#7e5520',
            800: '#67451f',
            900: '#573a1d',
          },
          cream: '#f5f0e8',
          white: '#ffffff',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
