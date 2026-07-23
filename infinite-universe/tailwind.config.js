/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        void: '#02030a',
        abyss: '#060a1a',
        nebula: '#7c5cff',
        plasma: '#28e0ff',
        solar: '#ffb454',
        rose: '#ff5d8f',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        drift: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.2' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slide-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
        twinkle: 'twinkle 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
