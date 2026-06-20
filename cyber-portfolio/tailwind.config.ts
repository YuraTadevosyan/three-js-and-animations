import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Blade Runner night + Cyberpunk 2077 neon palette.
        void: '#04060d',
        ink: '#070a14',
        panel: '#0b1020',
        neon: {
          cyan: '#00f0ff',
          blue: '#1b6bff',
          magenta: '#ff2bd6',
          pink: '#ff4d9d',
          violet: '#9d4dff',
          amber: '#ff9b3d',
          yellow: '#fcee0a', // CP2077 signature yellow
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Orbitron', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Share Tech Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 8px rgba(0,240,255,.55), 0 0 22px rgba(0,240,255,.35)',
        'neon-magenta': '0 0 8px rgba(255,43,214,.55), 0 0 22px rgba(255,43,214,.35)',
        glass: 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 40px rgba(0,0,0,.5)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(0,240,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.08) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(60% 60% at 50% 40%, rgba(27,107,255,.18), transparent 70%)',
      },
      keyframes: {
        flicker: {
          '0%,19%,21%,23%,25%,54%,56%,100%': { opacity: '1' },
          '20%,24%,55%': { opacity: '.35' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        flicker: 'flicker 4s linear infinite',
        scan: 'scan 6s linear infinite',
        floaty: 'floaty 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
