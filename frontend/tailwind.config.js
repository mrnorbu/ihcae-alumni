/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // IHCAE brand colors from logo
        primary: {
          // Forest green from outer ring and "conservation" text
          50: '#f0faf5',
          100: '#daf2e6',
          200: '#b7e4ce',
          300: '#87cea9',
          400: '#52b17f',
          500: '#137247', // Base forest green
          600: '#0d5e39',
          700: '#0a4c2e',
          800: '#073c24',
          900: '#052e1b',
          950: '#031f12', // Deep forest green
        },
        secondary: {
          // Rich blue from sky gradient and "exhilaration" text
          50: '#f0f7fd',
          100: '#dbebf9',
          200: '#bcdbf4',
          300: '#8dc2ec',
          400: '#57a4e2',
          500: '#1a6bb8', // Base sky/mountain blue
          600: '#135290',
          700: '#0f4273',
          800: '#0b335a',
          900: '#082643',
          950: '#051b30', // Deep azure blue
        },
        accent: {
          // Metallic silver-grey from banner and rope
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        mountain: {
          // Medium blue from mountain fills
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Modern neutral scale for compact UI
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Status colors for compact badges
        success: {
          50: '#f0faf5',
          100: '#daf2e6',
          500: '#137247',
          600: '#0d5e39',
          700: '#0a4c2e',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f7fd',
          100: '#dbebf9',
          500: '#1a6bb8',
          600: '#135290',
          700: '#0f4273',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-sky': 'linear-gradient(to bottom, #1a6bb8, #0b335a)', // Sky gradient from logo
        'gradient-brand': 'linear-gradient(135deg, #137247 0%, #1a6bb8 100%)', // Primary to secondary
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
