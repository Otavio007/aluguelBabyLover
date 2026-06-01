/** URL pública do site (Netlify). Usada em og:image e compartilhamento. */
export const SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://aluguelbabylover.netlify.app';
