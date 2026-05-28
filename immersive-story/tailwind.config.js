/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Archivo Black"',
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        // Blaugrana — club blue/red with a gold accent. Bone is a warm
        // off-white that reads as classic kit fabric.
        bone: '#f3f0e6',
        ash: '#101015',
        ink: '#05080f',
        bluaugrana: {
          blue: '#004D98',
          red: '#A50044',
          gold: '#EDBB00',
          yellow: '#FFED02',
        },
        pitch: '#1d6b35',
      },
    },
  },
  plugins: [],
};
