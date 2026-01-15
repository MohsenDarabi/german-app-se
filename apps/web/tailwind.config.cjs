/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{svelte,ts,js,html}', './index.html'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Persian-inspired color palette mapped to CSS variables
      colors: {
        // Primary: Persian Turquoise (فیروزه‌ای)
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-500)',
        },
        // Success: Persian Gold (طلایی)
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
          300: 'var(--color-success-300)',
          400: 'var(--color-success-400)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          800: 'var(--color-success-800)',
          900: 'var(--color-success-900)',
          DEFAULT: 'var(--color-success-500)',
        },
        // XP/Progress: Persian Indigo (لاجوردی)
        xp: {
          50: 'var(--color-xp-50)',
          100: 'var(--color-xp-100)',
          200: 'var(--color-xp-200)',
          300: 'var(--color-xp-300)',
          400: 'var(--color-xp-400)',
          500: 'var(--color-xp-500)',
          600: 'var(--color-xp-600)',
          700: 'var(--color-xp-700)',
          800: 'var(--color-xp-800)',
          900: 'var(--color-xp-900)',
          DEFAULT: 'var(--color-xp)',
          light: 'var(--color-xp-light)',
        },
        // Streak: Saffron Yellow (زعفرانی)
        streak: {
          50: 'var(--color-streak-50)',
          100: 'var(--color-streak-100)',
          200: 'var(--color-streak-200)',
          300: 'var(--color-streak-300)',
          400: 'var(--color-streak-400)',
          500: 'var(--color-streak-500)',
          600: 'var(--color-streak-600)',
          700: 'var(--color-streak-700)',
          800: 'var(--color-streak-800)',
          900: 'var(--color-streak-900)',
          DEFAULT: 'var(--color-streak)',
          light: 'var(--color-streak-light)',
        },
        // Error: Persian Burgundy (زرشکی)
        error: {
          50: 'var(--color-error-50)',
          100: 'var(--color-error-100)',
          200: 'var(--color-error-200)',
          300: 'var(--color-error-300)',
          400: 'var(--color-error-400)',
          500: 'var(--color-error-500)',
          600: 'var(--color-error-600)',
          700: 'var(--color-error-700)',
          800: 'var(--color-error-800)',
          900: 'var(--color-error-900)',
          DEFAULT: 'var(--color-error-500)',
        },
        // Gems/Premium: Emerald Green (زمردی)
        gem: {
          50: 'var(--color-gem-50)',
          100: 'var(--color-gem-100)',
          200: 'var(--color-gem-200)',
          300: 'var(--color-gem-300)',
          400: 'var(--color-gem-400)',
          500: 'var(--color-gem-500)',
          600: 'var(--color-gem-600)',
          700: 'var(--color-gem-700)',
          800: 'var(--color-gem-800)',
          900: 'var(--color-gem-900)',
          DEFAULT: 'var(--color-gem)',
          light: 'var(--color-gem-light)',
        },
        // Accent: Persian Rose (گلابی)
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
        },
        // Achievement: Persian Gold Shimmer
        achievement: {
          DEFAULT: 'var(--color-achievement)',
          light: 'var(--color-achievement-light)',
        },
        // Warm neutrals (کرم)
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
      },
      // Font family with Vazirmatn for Persian
      fontFamily: {
        sans: ['Vazirmatn', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Vazirmatn', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Border radius scale
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      // Shadows including colored glows
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
        'primary': 'var(--shadow-primary)',
        'success': 'var(--shadow-success)',
        'xp': 'var(--shadow-xp)',
        'streak': 'var(--shadow-streak)',
        'error': 'var(--shadow-error)',
        'glow-primary': '0 0 20px 4px var(--color-primary-400)',
        'glow-success': '0 0 20px 4px var(--color-success-400)',
        'glow-xp': '0 0 20px 4px var(--color-xp-400)',
        'glow-streak': '0 0 20px 4px var(--color-streak-400)',
      },
      // Custom animations
      animation: {
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-bounce': 'scale-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'confetti-fall': 'confetti-fall 1.5s ease-out forwards',
        'float-up': 'float-up 1s ease-out forwards',
        'shine': 'shine 2s ease-in-out infinite',
        'flame': 'flame-flicker 0.5s ease-in-out infinite',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--color-primary-500)', opacity: '1' },
          '50%': { boxShadow: '0 0 20px 4px var(--color-primary-400)', opacity: '0.8' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-bounce': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1.2)' },
        },
        'shine': {
          '0%': { left: '-100%' },
          '50%, 100%': { left: '100%' },
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '25%': { transform: 'scale(1.05) rotate(2deg)' },
          '50%': { transform: 'scale(0.95) rotate(-1deg)' },
          '75%': { transform: 'scale(1.02) rotate(1deg)' },
        },
      },
      // Transition timing functions
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      // Component sizing
      minHeight: {
        'touch': 'var(--touch-target-min)',
      },
      height: {
        'navbar': 'var(--navbar-height)',
        'bottom-nav': 'var(--bottom-nav-height)',
      },
      // Z-index scale
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'toast': 'var(--z-toast)',
        'max': 'var(--z-max)',
      },
      // Backdrop blur for glassmorphism
      backdropBlur: {
        'glass': 'var(--glass-blur)',
        'glass-strong': 'var(--glass-blur-strong)',
      },
    },
  },
  plugins: [],
};
