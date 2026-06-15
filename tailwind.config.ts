import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Font ────────────────────────────────────────────────────
      fontFamily: {
        sans:        ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        poppins:     ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },

      // ── Font Scale (Stitch MD3) ──────────────────────────────────
      fontSize: {
        'display-lg':  ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md':  ['48px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'body-lg':     ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        'body-md':     ['16px', { lineHeight: '1.6', fontWeight: '500' }],
        'label-lg':    ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md':    ['12px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '600' }],
      },

      // ── Colors (Stitch MD3 tam token seti) ──────────────────────
      colors: {
        // Primary
        'primary':                    '#4f20c0',
        'primary-container':          '#6741d9',
        'primary-fixed':              '#e7deff',
        'primary-fixed-dim':          '#ccbdff',
        'on-primary':                 '#ffffff',
        'on-primary-fixed':           '#1f0060',
        'on-primary-fixed-variant':   '#4d1ebf',
        'on-primary-container':       '#e0d5ff',
        'inverse-primary':            '#ccbdff',
        'surface-tint':               '#653fd7',
        // Secondary
        'secondary':                  '#5c5f60',
        'secondary-container':        '#e1e3e4',
        'secondary-fixed':            '#e1e3e4',
        'secondary-fixed-dim':        '#c5c7c8',
        'on-secondary':               '#ffffff',
        'on-secondary-container':     '#626566',
        'on-secondary-fixed':         '#191c1d',
        'on-secondary-fixed-variant': '#454748',
        // Tertiary
        'tertiary':                   '#45484a',
        'tertiary-container':         '#5d6062',
        'tertiary-fixed':             '#e0e3e5',
        'tertiary-fixed-dim':         '#c4c7c9',
        'on-tertiary':                '#ffffff',
        'on-tertiary-container':      '#d9dbdd',
        'on-tertiary-fixed':          '#191c1e',
        'on-tertiary-fixed-variant':  '#444749',
        // Background / Surface
        'background':                 '#f7f9ff',
        'on-background':              '#181c20',
        'surface':                    '#f7f9ff',
        'surface-bright':             '#f7f9ff',
        'surface-dim':                '#d7dadf',
        'surface-variant':            '#e0e3e8',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f1f4f9',
        'surface-container':          '#ebeef3',
        'surface-container-high':     '#e5e8ee',
        'surface-container-highest':  '#e0e3e8',
        'on-surface':                 '#181c20',
        'on-surface-variant':         '#494454',
        'inverse-surface':            '#2d3135',
        'inverse-on-surface':         '#eef1f6',
        // Outline
        'outline':                    '#7a7486',
        'outline-variant':            '#cac3d7',
        // Error
        'error':                      '#ba1a1a',
        'error-container':            '#ffdad6',
        'on-error':                   '#ffffff',
        'on-error-container':         '#93000a',
      },

      // ── Border Radius (Stitch scale) ─────────────────────────────
      borderRadius: {
        DEFAULT: '1rem',
        sm:      '0.5rem',
        md:      '0.75rem',
        lg:      '2rem',
        xl:      '3rem',
        '2xl':   '4rem',
        full:    '9999px',
      },

      // ── Spacing (Stitch custom tokens) ───────────────────────────
      spacing: {
        'stack-sm':       '24px',
        'stack-md':       '48px',
        'stack-lg':       '80px',
        'margin-mobile':  '24px',
        'margin-desktop': '64px',
        'gutter':         '32px',
        'unit':           '8px',
      },

      // ── Shadows ──────────────────────────────────────────────────
      boxShadow: {
        'premium':    '0px 20px 40px rgba(0, 0, 0, 0.04)',
        'premium-lg': '0px 32px 64px rgba(0, 0, 0, 0.08)',
        'primary-glow': '0px 8px 24px rgba(79, 32, 192, 0.20)',
      },

      // ── Max-width utility ────────────────────────────────────────
      maxWidth: {
        'container': '1280px',
      },

      // ── Keyframes & animations ───────────────────────────────────
      keyframes: {
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to':   { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float':      'subtle-float 6s ease-in-out infinite',
        'fade-up':    'fade-in-up 0.8s ease-out forwards',
        'spin-slow':  'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
