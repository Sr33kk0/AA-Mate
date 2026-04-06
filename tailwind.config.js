/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map Tailwind utilities to CSS variables for full light/dark switching
        bg: 'var(--color-background)',
        subground: 'var(--color-subground)',
        text: 'var(--color-text)',
        subtext: 'var(--color-subtext)',
        border: 'var(--color-border)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        warning: 'var(--color-warning)',
        // Legacy statics kept for backwards compat
        accent: {
          pink: '#FF007F',
          green: '#059669'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'blink-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
      },
      animation: {
        'blink-slow': 'blink-slow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
