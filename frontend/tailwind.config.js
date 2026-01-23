/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BankDash Design System
        primary: {
          DEFAULT: '#1814F3',
          light: '#2D60FF',
          dark: '#1209AB',
        },
        secondary: '#343C6A',
        accent: {
          blue: '#396AFF',
          cyan: '#16DBCC',
          green: '#41D4A8',
          orange: '#FFBB38',
          pink: '#FF82AC',
          red: '#FE5C73',
        },
        gray: {
          50: '#F5F7FA',
          100: '#E6EFF5',
          200: '#DFEAF2',
          300: '#B1B1B1',
          400: '#8BA3CB',
          500: '#718EBF',
          600: '#505887',
          700: '#343C6A',
          800: '#232323',
          900: '#1A1A1A',
        },
        success: '#41D4A8',
        warning: '#FFBB38',
        error: '#FE5C73',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '25px',
        'btn': '50px',
        'input': '40px',
      },
      boxShadow: {
        'card': '0px 4px 20px rgba(0, 0, 0, 0.05)',
        'sidebar': '4px 0 20px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts with Ant Design
  },
}
