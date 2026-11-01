/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        detective: {
          950: '#0b0f19',
          900: '#0f172a',
          850: '#151f38',
          800: '#1e293b',
          700: '#334155',
          gold: '#eab308',
          blood: '#dc2626',
          cyan: '#06b6d4',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace', 'ui-monospace'],
        serif: ['Georgia', 'Cambria', 'serif']
      }
    },
  },
  plugins: [],
}

