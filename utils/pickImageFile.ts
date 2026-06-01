import { Platform } from 'react-native';

/** Seleciona uma imagem no navegador (painel admin web). */
export function pickImageFile(): Promise<File | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0] ?? null;
      resolve(file);
    };
    input.click();
  });
}
