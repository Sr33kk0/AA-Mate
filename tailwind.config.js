/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(0% 0 0)',
        surface: 'oklch(15% 0.01 260)',
        'surface-light': 'oklch(25% 0.02 260)',
        primary: 'oklch(98% 0 0)',
        secondary: 'oklch(70% 0.02 260)',
        accent: {
          pink: 'oklch(65% 0.25 350)',
          green: 'oklch(75% 0.2 140)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
