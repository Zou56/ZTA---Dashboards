/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:      '#050814',
          card:    '#090d19',
          border:  '#1e2d4a',
          muted:   '#8b949e',
          teal:    '#22d3ee',
          violet:  '#a78bfa',
          rose:    '#f43f5e',
          amber:   '#fbbf24',
          green:   '#34d399',
          blue:    '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(15px)' },
                   to:   { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
