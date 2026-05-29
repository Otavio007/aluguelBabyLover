import { Platform } from 'react-native';

export function downloadPdfBlob(blob: Blob, fileName: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  throw new Error('Download de PDF disponível apenas na web.');
}
