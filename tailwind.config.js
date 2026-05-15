/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#fff8f5',
          100: '#ffedd6',
          200: '#ffd7ad',
          300: '#ffba7a',
          400: '#ff923d',
          500: '#ff6b00',
          600: '#e85800',
          700: '#c14400',
          800: '#9a3602',
          900: '#7d2e04',
          950: '#441600',
        },
        secondary: {
          50: '#f2ffe9',
          100: '#e0ffc8',
          200: '#c2ff97',
          300: '#96ff58',
          400: '#68f41d',
          500: '#3dd200',
          600: '#2ca400',
          700: '#267e02',
          800: '#236406',
          900: '#1f5408',
          950: '#0c2f00',
        },
        dark: {
          900: '#0f1115',
          800: '#171a21',
          700: '#1e212b',
          600: '#252936',
          500: '#303647',
          400: '#454c60',
          300: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-up': 'fadeUp 0.6s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'wiggle': 'wiggle 1s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 107, 0, 0.6)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};
