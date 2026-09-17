import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sentinel/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sentina/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070104',
        foreground: '#f8fafc',
        card: '#110207',
        'card-hover': '#1a030c',
        'card-elevated': '#250512',
        border: 'rgba(255, 23, 68, 0.28)',
        'border-subtle': 'rgba(255, 23, 68, 0.18)',
        primary: '#ff1744',
        'primary-hover': '#ff5252',
        'primary-dark': '#d50000',
        secondary: '#94a3b8',
        muted: '#64748b',
        accent: '#ff1744',
        'accent-cyan': '#ff1744',
        'accent-purple': '#e11d48',
        'accent-emerald': '#ff1744',
        'accent-amber': '#ff5252',
        danger: '#ff1744',
        warning: '#f59e0b',
        success: '#10b981',
        'glow-primary': 'rgba(255, 23, 68, 0.7)',
        'glow-red': 'rgba(255, 23, 68, 0.75)',
        'glow-cyan': 'rgba(255, 23, 68, 0.7)',
        'glow-green': 'rgba(255, 23, 68, 0.6)',
        'glow-purple': 'rgba(225, 29, 72, 0.6)',
        'glow-orange': 'rgba(255, 82, 82, 0.6)',
        // Sentinel Cyber-Command Colors (Crimson Tactical Obsidian Palette)
        command: {
          950: '#070104',
          900: '#110207',
          850: '#18030a',
          800: '#22040f',
          700: '#330617',
          glow: '#ff1744',
          neonBlue: '#ff1744',
          brightBlue: '#ff5252',
          crimson: '#ff1744',
          emerald: '#ff1744',
          amber: '#f59e0b',
          purple: '#e11d48'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 23, 68, 0.6)',
        'glow-red': '0 0 24px rgba(255, 23, 68, 0.8)',
        'glow-strong': '0 0 35px rgba(255, 23, 68, 0.9)',
        'glow-cyan': '0 0 20px rgba(255, 23, 68, 0.6)',
        'glow-green': '0 0 20px rgba(255, 23, 68, 0.6)',
        'glow-purple': '0 0 20px rgba(225, 29, 72, 0.6)',
        'glow-orange': '0 0 20px rgba(255, 82, 82, 0.6)',
        'glow-intense': '0 0 24px rgba(255, 23, 68, 0.9), 0 0 45px rgba(225, 29, 72, 0.6)',
        'glow-text': '0 0 12px rgba(255, 23, 68, 0.8)',
        cyber: '0 0 25px -5px rgba(7, 1, 4, 0.9), inset 0 0 15px 0 rgba(255, 23, 68, 0.08)',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        hud: ['"Chakra Petch"', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulseRedGlow 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-fast': 'spinClockwise 7s linear infinite',
        'spin-medium': 'spinClockwise 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spinClockwise: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulseRedGlow: {
          '0%, 100%': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 23, 68, 0.75)',
          },
          '50%': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), 0 0 45px rgba(255, 23, 68, 0.95)',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
