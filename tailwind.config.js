/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0c0f0d',
          800: '#121613',
          700: '#171c19',
          600: '#1d2421',
          500: '#262e2a',
          400: '#323c37',
        },
        sage: {
          50: '#f2f6f3',
          100: '#dde8e1',
          200: '#bdd2c4',
          300: '#9bb8a4',
          400: '#7fa088',
          500: '#638869',
          600: '#4e6c54',
          700: '#3e5642',
          800: '#324535',
          900: '#283529',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.02), 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(127,160,136,0.25), 0 8px 30px -10px rgba(127,160,136,0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0.4' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'strike': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'pop': 'pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up': 'slide-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
