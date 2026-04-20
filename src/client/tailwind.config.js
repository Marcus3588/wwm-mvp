module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF9F3',
          100: '#F7F3E7',
          200: '#E8DFC3',
          300: '#D4C494',
          400: '#C9A962',
          500: '#B8924A',
          600: '#9A7A3D',
          700: '#7A6131',
          800: '#5C4925',
          900: '#3D301A'
        },
        luxury: {
          black: '#0A0A0A',
          charcoal: '#1A1A1A',
          dark: '#2D2D2D',
          cream: '#FAF8F5',
          ivory: '#FFFFF0'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
};