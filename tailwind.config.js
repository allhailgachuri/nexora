/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#101522',
          cardHover: '#161d2f',
          border: '#1e293b',
          borderLight: '#334155',
          accent: '#06b6d4',
          accentGlow: 'rgba(6, 182, 212, 0.25)',
          neonGreen: '#10b981',
          neonAmber: '#f59e0b',
          neonRed: '#ef4444',
          neonPurple: '#8b5cf6',
          textMuted: '#94a3b8',
          textBright: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'cyber-glow': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'danger-glow': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'success-glow': '0 0 20px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
