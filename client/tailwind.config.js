/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#101014',
        surface: {
          DEFAULT: '#18181F',
          light: '#22222B',
          lighter: '#2C2C38',
          border: '#282834',
        },
        burgundy: {
          DEFAULT: '#791D35',
          hover: '#932441',
          dark: '#541425',
          light: '#A62A4B',
        },
        accent: {
          DEFAULT: '#D6A85F',
          hover: '#E5BD7A',
          dark: '#B58B43',
          light: '#F4DCAC',
        },
        text: {
          primary: '#F6F2ED',
          secondary: '#A6A1A1',
          muted: '#6C6868',
        },
        success: '#2EAD75',
        danger: '#D94A55',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cinzel', 'Outfit', 'serif'],
      },
      boxShadow: {
        'glow-burgundy': '0 0 25px -5px rgba(121, 29, 53, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(214, 168, 95, 0.35)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

