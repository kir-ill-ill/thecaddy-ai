/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1A4D2E',
          light: '#2A6B42',
          dark: '#0F3A1F',
        },
        sand: {
          DEFAULT: '#F5F5DC',
          light: '#FAFAF0',
          dark: '#E8E5CC',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C84A',
          dark: '#B8942B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-up-delay-1': 'fadeInUp 0.6s ease-out 0.1s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.2s forwards',
        'fade-in-up-delay-3': 'fadeInUp 0.6s ease-out 0.3s forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
