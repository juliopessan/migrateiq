import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ava: {
          orange:      '#FF5800',
          'dark-orange': '#DC4600',
          black:       '#000000',
          white:       '#FFFFFF',
          'grey-80':   '#333333',
          'grey-70':   '#4c4c4c',
          'grey-60':   '#666666',
          'grey-50':   '#7f7f7f',
          'grey-40':   '#999999',
          'grey-30':   '#b3b3b3',
          'grey-20':   '#cccccc',
          'grey-10':   '#e5e5e5',
          solar:       '#FFD700',
          luminous:    '#FFB414',
          glow:        '#FF5800',
          flame:       '#B43C14',
          thermal:     '#C80000',
          aurora:      '#890078',
          success:     '#00A650',
          warning:     '#FFB414',
          error:       '#C80000',
          info:        '#0078D4',
        },
      },
      fontFamily: {
        ava: [
          'Segoe UI', 'Segoe UI Variable', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      backgroundImage: {
        'ava-master':  'linear-gradient(135deg, #FF5800 0%, #890078 100%)',
        'ava-warm':    'linear-gradient(135deg, #FFD700 0%, #FF5800 100%)',
        'ava-full':    'linear-gradient(135deg, #FFD700 0%, #FFB414 20%, #FF5800 40%, #B43C14 60%, #C80000 80%, #890078 100%)',
        'ava-hero':    'linear-gradient(135deg, #1a0a00 0%, #2d0020 100%)',
      },
      boxShadow: {
        'ava-brand': '0 4px 20px rgba(255,88,0,0.28)',
        'ava-md':    '0 4px 12px rgba(0,0,0,0.10)',
        'ava-lg':    '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'ava-sm': '2px',
        'ava-md': '4px',
        'ava-lg': '8px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
