/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{vue,ts}', './app.vue', './nuxt.config.ts'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        panel: {
          DEFAULT: 'hsl(var(--panel))',
          foreground: 'hsl(var(--panel-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        light: {
          DEFAULT: 'hsl(var(--light))',
          foreground: 'hsl(var(--light-foreground))',
        },
        dark: {
          DEFAULT: 'hsl(var(--dark))',
          foreground: 'hsl(var(--dark-foreground))',
        },
        accent: 'hsl(var(--accent))',
        danger: 'hsl(var(--danger))',
        warn: 'hsl(var(--warn))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 3px)',
        sm: 'calc(var(--radius) - 6px)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'panel-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sweep': {
          from: { transform: 'translateX(-110%)' },
          to: { transform: 'translateX(110%)' },
        },
        'pulse-ring': {
          '0%': { opacity: '.9', transform: 'scale(.7)' },
          '100%': { opacity: '0', transform: 'scale(1.6)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .4s ease both',
        'panel-in': 'panel-in .35s cubic-bezier(.22,1,.36,1) both',
        sweep: 'sweep 2.4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
