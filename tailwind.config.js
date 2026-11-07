/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#030712',
          800: '#0B132B',
          700: '#1C2541',
          600: '#3A506B',
        },
        gold: {
          300: '#FFE699',
          400: '#F5D061',
          500: '#E5B869',
          600: '#C69234',
        },
        medical: {
          rose: '#F43F5E',
          cyan: '#06B6D4',
          emerald: '#10B981',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(245, 208, 97, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(245, 208, 97, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
