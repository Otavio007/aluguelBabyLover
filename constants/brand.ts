/** Cores e assets da marca AlugaKi Baby */
export const BRAND = {
  primary: '#4C007D',
  primaryDark: '#3A005E',
  primaryLight: '#F5E6FF',
  primaryMuted: '#9B33E0',
  accent: '#FF6CB6',
  accentLight: '#FFF0F7',
  yellow: '#FFD54F',
  yellowLight: '#FFF9E6',
} as const;

/** Logo principal (fundo branco) — header claro */
export const LOGO_MAIN = require('@/assets/images/logo.jpg');

/** Logo branca (fundo escuro) — footer alternativo */
export const LOGO_FULL_WHITE = require('@/assets/images/logo-full-white.png');

/** Mascote (bebê) — header, ícones decorativos */
export const LOGO_MASCOT = require('@/assets/images/logo-mascot.png');

/** @deprecated use LOGO_MAIN ou LOGO_MASCOT */
export const LOGO = LOGO_MAIN;
