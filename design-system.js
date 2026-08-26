/**
 * Sinergia Design System v1.0
 * Sistema de diseño centralizado para consistencia visual
 */

const DS = {
  // ═══ PALETA DE COLORES ═══
  colors: {
    // Primarios (Azul moderno)
    primary: '#0052CC',
    primary_light: '#3B82F6',
    primary_dark: '#003D99',

    // Secundarios (Púrpura)
    secondary: '#7C3AED',
    secondary_light: '#A78BFA',
    secondary_dark: '#5B21B6',

    // Accent (Naranja energético)
    accent: '#FF6B35',
    accent_light: '#FFA562',
    accent_dark: '#CC5500',

    // Neutrales (Escala de grises)
    neutral: {
      0: '#FFFFFF',
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semánticos
    success: '#10B981',
    success_light: '#6EE7B7',
    warning: '#F59E0B',
    warning_light: '#FCD34D',
    danger: '#EF4444',
    danger_light: '#F87171',
    info: '#06B6D4',
    info_light: '#22D3EE',

    // Gradientes
    gradient: {
      primary: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
      accent: 'linear-gradient(135deg, #FF6B35 0%, #FFA562 100%)',
      success: 'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)',
      dark: 'linear-gradient(160deg, #111827 0%, #1F2937 50%, #374151 100%)',
    }
  },

  // ═══ TIPOGRAFÍA ═══
  typography: {
    font_family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    font_family_mono: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",

    // Scale (rem-based)
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },

    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    line_height: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    }
  },

  // ═══ ESPACIADO ═══
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },

  // ═══ ESQUINAS (Border Radius) ═══
  radius: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },

  // ═══ SOMBRAS ═══
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // ═══ TRANSICIONES ═══
  transition: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
    slowest: '500ms ease-out',
  },

  // ═══ Z-INDEX ═══
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal_backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ═══ BREAKPOINTS (Mobile-First) ═══
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultra: '1536px',
  },

  // ═══ COMPONENTES BASE ═══
  components: {
    button: {
      base: `
        font-family: ${this.typography.font_family};
        font-weight: ${this.typography.weight.semibold};
        border: none;
        border-radius: ${this.radius.lg};
        cursor: pointer;
        transition: all ${this.transition.base};
        min-height: 44px;
        padding: ${this.spacing[3]} ${this.spacing[4]};
        font-size: ${this.typography.size.base};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${this.spacing[2]};
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      `,
      primary: `background: ${this.colors.primary}; color: white;`,
      secondary: `background: ${this.colors.secondary}; color: white;`,
      accent: `background: ${this.colors.accent}; color: white;`,
      ghost: `background: transparent; border: 1px solid ${this.colors.neutral[300]}; color: ${this.colors.neutral[900]};`,
      disabled: `opacity: 0.5; cursor: not-allowed;`,
    },

    card: {
      base: `
        background: white;
        border-radius: ${this.radius.xl};
        padding: ${this.spacing[6]};
        box-shadow: ${this.shadow.base};
        transition: all ${this.transition.base};
      `,
      elevated: `box-shadow: ${this.shadow.lg};`,
      interactive: `cursor: pointer; &:hover { box-shadow: ${this.shadow.md}; transform: translateY(-2px); }`,
    },

    input: {
      base: `
        font-family: ${this.typography.font_family};
        font-size: ${this.typography.size.base};
        padding: ${this.spacing[3]} ${this.spacing[4]};
        border: 1px solid ${this.colors.neutral[300]};
        border-radius: ${this.radius.lg};
        transition: all ${this.transition.base};
        &:focus {
          outline: none;
          border-color: ${this.colors.primary};
          box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
        }
      `,
    },

    badge: {
      base: `
        display: inline-block;
        padding: ${this.spacing[1]} ${this.spacing[3]};
        border-radius: ${this.radius.full};
        font-size: ${this.typography.size.xs};
        font-weight: ${this.typography.weight.semibold};
      `,
      primary: `background: ${this.colors.primary_light}; color: white;`,
      success: `background: ${this.colors.success_light}; color: white;`,
    },
  }
};

// Exportar para uso en toda la app
if (typeof module !== 'undefined' && module.exports) module.exports = DS;
