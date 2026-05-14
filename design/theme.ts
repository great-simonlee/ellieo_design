/**
 * Visual tokens — social surface system (see DESIGN_RULES.md).
 */
export const colors = {
  /** Main theme — keep in sync with DESIGN_RULES.md */
  primary: '#2F6DF6',
  void: '#060508',
  canvasTop: '#0d0912',
  canvasMid: '#110b18',
  canvasBottom: '#060508',
  surface: 'rgba(255,255,255,0.045)',
  surfaceLift: 'rgba(255,255,255,0.08)',
  stroke: 'rgba(255,255,255,0.09)',
  strokeBright: 'rgba(255,255,255,0.16)',
  coral: '#ff5c7a',
  coralDeep: '#e11d48',
  violet: '#a855f7',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  text: '#f8f7fc',
  textMuted: 'rgba(248,247,252,0.62)',
  textSoft: 'rgba(248,247,252,0.4)',
  textFaint: 'rgba(248,247,252,0.28)',
  verified: '#38bdf8',
  danger: '#fb7185',
  overlay: 'rgba(0,0,0,0.45)',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const type = {
  micro: 11,
  caption: 13,
  body: 15,
  bodyLarge: 17,
  title: 20,
  display: 26,
};

/** Light blue → brand blue, left → right (matches Log In / OnboardingBottomCta). */
export const gradientPrimaryHorizontal: [string, string] = [
  '#7BA6FF',
  colors.primary,
];
