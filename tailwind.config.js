/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carton: '#C19A6B',
        ruban: '#FACC15',
        metal: '#9CA3AF',
        match: '#22C55E',
        next: '#EF4444',
        ink: '#0B0F17',
        panel: '#111827',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(250, 204, 21, 0.45)',
        'neon-strong': '0 0 40px rgba(250, 204, 21, 0.65)',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.7))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(250,204,21,0.3))' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
