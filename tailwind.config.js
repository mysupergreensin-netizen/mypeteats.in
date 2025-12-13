/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './layouts/**/*.{js,jsx,ts,tsx}',
    './data/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          25: '#fbf7ff',
          50: '#f7f1ff',
          100: '#ecdafe',
          200: '#d5b0fd',
          300: '#bf86fc',
          400: '#a55cfa',
          500: '#8a32f8',
          600: '#691ad5',
          700: '#4b0fa6',
          800: '#330874',
          900: '#21044a',
        },
        surface: {
          50: 'rgba(255,255,255,0.02)',
          100: 'rgba(255,255,255,0.04)',
          200: 'rgba(255,255,255,0.06)',
        },
        border: {
          subtle: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
        },
        midnight: '#1a103d',
        twilight: '#2b0d5c',
        orchid: '#a14cff',
        lilac: '#caa8ff',
        amberlite: '#f9c784',
        petal: '#f8f1ff',
        slate: '#0f172a',
        purple: '#8027fa',
        'mid-violet': '#7B2DCC',
        'highlight-purple': '#A14CFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 60px rgba(66, 10, 143, 0.35)',
        card: '0 12px 40px rgba(26, 16, 61, 0.18)',
        elevated: '0 18px 45px rgba(15, 23, 42, 0.55)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #8027fa 0%, #7B2DCC 40%, #A14CFF 100%)',
        'card-gradient':
          'linear-gradient(145deg, rgba(66,10,143,0.9), rgba(161,76,255,0.9))',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};


