/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        phoenix: {
          primary: '#1A4D8C', // Deep Azure
          secondary: '#407CC7', // Trust Blue
          accent: '#78909C', // Slate Accent
          success: '#2E7D32', // Deep Emerald
          warning: '#F9A825', // Amber
          danger: '#D32F2F', // Deep Red
          bg: '#E3F2FD', // Light Sky Blue
          card: '#FFFFFF',
          'text-main': '#011F3F', // Midnight Navy
          'text-muted': '#455A64', // Dark Slate Grey
          border: '#CFD8DC', // Soft Grey Blue
        },
      },
      fontSize: {
        'readable-xs': ['0.85rem', { lineHeight: '1.25' }],
        'readable-sm': ['1rem', { lineHeight: '1.5' }],
        'readable-base': ['1.125rem', { lineHeight: '1.6' }],
        'readable-lg': ['1.25rem', { lineHeight: '1.6' }],
        'readable-xl': ['1.5rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
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
