import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tucker Brand Colors
        tucker: {
          orange: '#D97706',
          dark: '#B45309',
          light: '#FBBF24',
          cream: '#FEF3C7',
          'warm-white': '#FFFBEB',
        },
        primary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D97706',  // Tucker Orange
          600: '#B45309',  // Tucker Dark
          700: '#92400E',
          800: '#78350F',
          900: '#451A03',
        },
        // Semantic colors
        success: '#16A34A',
        warning: '#EAB308',
        error: '#DC2626',
        info: '#0EA5E9',
      },
    },
  },
  plugins: [],
}

export default config
