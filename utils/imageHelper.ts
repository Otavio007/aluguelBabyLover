/**
 * Helper utilities for processing product images.
 * Since multiple images can be stored in the single text field 'imagem' as a JSON array or comma-separated list,
 * these helpers parse the field to return an array of image URLs or retrieve the primary (first) image.
 */

export const getProductImages = (imagem: string | null | undefined): string[] => {
  if (!imagem) return [];
  
  const trimmed = imagem.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
      }
    } catch (e) {
      // Failed to parse JSON, fallback to comma split or single URL
    }
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map(url => url.trim()).filter(Boolean);
  }

  return [trimmed];
};

export const getFirstProductImage = (
  imagem: string | null | undefined,
  placeholder = 'https://via.placeholder.com/300'
): string => {
  const images = getProductImages(imagem);
  return images[0] || placeholder;
};
