module.exports = {
  content: ['apps/dashboard/src/**/*.{html,ts}'],
  safelist: ['bg-background', 'text-foreground', 'text-muted-foreground'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        background: {
          DEFAULT: 'var(--p-surface-ground)',
        },
        foreground: {
          DEFAULT: 'var(--p-text-color)',
        },
        'muted-foreground': {
          DEFAULT: 'var(--p-text-secondary-color)',
        },
        surface: {
          0: 'var(--p-surface-0)',
          50: 'var(--p-surface-50)',
          100: 'var(--p-surface-100)',
          200: 'var(--p-surface-200)',
          300: 'var(--p-surface-300)',
          400: 'var(--p-surface-400)',
          500: 'var(--p-surface-500)',
          600: 'var(--p-surface-600)',
          700: 'var(--p-surface-700)',
          800: 'var(--p-surface-800)',
          900: 'var(--p-surface-900)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
