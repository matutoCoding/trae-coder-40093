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
        medical: {
          50: '#eaf3fb',
          100: '#d0e3f3',
          200: '#a1c7e8',
          300: '#72abd9',
          400: '#4590c9',
          500: '#1E5FA8',
          600: '#195290',
          700: '#144477',
          800: '#0f355e',
          900: '#0a2745',
        },
        trust: {
          50: '#eafaf0',
          100: '#c9efd7',
          200: '#92dfaf',
          300: '#5ccf87',
          400: '#34bf68',
          500: '#2E8B57',
          600: '#26754a',
          700: '#1e5e3c',
          800: '#17482e',
          900: '#0f3120',
        },
        warn: {
          50: '#fdf3e8',
          100: '#fadfb5',
          200: '#f6c581',
          300: '#f1ab4c',
          400: '#ec911c',
          500: '#E67E22',
          600: '#c26a1e',
          700: '#9d5518',
          800: '#794012',
          900: '#542b0c',
        },
        danger: {
          50: '#fceceb',
          100: '#f7c8c5',
          200: '#ef918b',
          300: '#e75a52',
          400: '#e03d34',
          500: '#E74C3C',
          600: '#c04032',
          700: '#993428',
          800: '#72281e',
          900: '#4b1c14',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(30, 95, 168, 0.08), 0 4px 20px -4px rgba(30, 95, 168, 0.06)',
        'card-hover': '0 8px 24px -4px rgba(30, 95, 168, 0.12), 0 12px 36px -8px rgba(30, 95, 168, 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
