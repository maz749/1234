/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream:        '#f7f4ef',
        charcoal:     '#1c1916',
        taupe:        '#8a8278',
        gold:         '#9c8a72',
        'gold-light': '#c8b89e',
        'gold-dark':  '#5a4a38',
        'dark-taupe': '#3a3028',
        'light-taupe':'#d8d0c4',
        void:         '#0e0c0a',
        surface:      '#1a1714',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
