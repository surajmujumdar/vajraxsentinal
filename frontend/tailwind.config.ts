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
        background: '#020617',
        foreground: '#f8fafc',
        card: '#070f24',
        'card-hover': '#0a1532',
        'card-elevated': '#0f1d42',
        border: 'rgba(56, 189, 248, 0.2)',
        'border-subtle': 'rgba(6, 182, 212, 0.15)',
        primary: '#00f2fe',
        'primary-hover': '#38bdf8',
        'primary-dark': '#0284c7',
        secondary: '#94a3b8',
        muted: '#64748b',
        accent: '#00f2fe',
        'accent-cyan': '#00f2fe',
        'accent-purple': '#c084fc',
        'accent-emerald': '#10b981',
        'accent-amber': '#fbbf24',
        danger: '#f43f5e',
        warning: '#f59e0b',
        success: '#10b981',
        'glow-primary': 'rgba(0, 242, 254, 0.6)',
        'glow-red': 'rgba(244, 63, 94, 0.6)',
        'glow-cyan': 'rgba(0, 242, 254, 0.6)',
        'glow-green': 'rgba(16, 185, 129, 0.6)',
        'glow-purple': 'rgba(168, 85, 247, 0.6)',
        'glow-orange': 'rgba(249, 115, 22, 0.6)',
        // Sentinel Cyber-Command Colors
        command: {
          950: '#040814',
          900: '#070f24',
          850: '#0a1532',
          800: '#0f1d42',
          700: '#16285a',
          glow: '#00e5ff',
          neonBlue: '#2563eb',
          brightBlue: '#38bdf8',
          crimson: '#f43f5e',
          emerald: '#10b981',
          amber: '#f59e0b',
          purple: '#8b5cf6'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 242, 254, 0.5)',
        'glow-red': '0 0 22px rgba(244, 63, 94, 0.6)',
        'glow-strong': '0 0 30px rgba(0, 242, 254, 0.75)',
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.6)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.6)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.6)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.6)',
        'glow-intense': '0 0 24px rgba(0, 242, 254, 0.85), 0 0 45px rgba(56, 189, 248, 0.5)',
        'glow-text': '0 0 10px rgba(0, 242, 254, 0.6)',
        cyber: '0 0 25px -5px rgba(2, 6, 23, 0.8), inset 0 0 15px 0 rgba(37, 99, 235, 0.05)',
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
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 23, 68, 0.65)',
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
