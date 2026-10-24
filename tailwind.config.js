/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        magenta: {
          DEFAULT: '#D91680',
          50: '#FDEEF4',
          100: '#FCD8E8',
          200: '#F8B1D2',
          300: '#F380B5',
          400: '#EB4495',
          500: '#D91680',
          600: '#BA0D6B',
          700: '#960956',
          800: '#750B44',
          900: '#4B1248',
        },
        'deep-purple': {
          DEFAULT: '#4B1248',
          950: '#230622',
        },
        crimson: {
          DEFAULT: '#E62044',
          dark: '#B81432',
        },
        blush: {
          DEFAULT: '#FDEEF4',
          light: '#FFF7FA',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          800: '#222222',
          900: '#141414',
          950: '#0B070E',
        },
        neutral: {
          DEFAULT: '#666666',
          muted: '#8E8E93',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aura-gradient': 'linear-gradient(135deg, #D91680 0%, #E62044 50%, #4B1248 100%)',
        'hero-gradient': 'linear-gradient(135deg, #4B1248 0%, #1A0819 60%, #0B070E 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'aura': '0 10px 30px -10px rgba(217, 22, 128, 0.3)',
        'aura-lg': '0 20px 40px -15px rgba(217, 22, 128, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
