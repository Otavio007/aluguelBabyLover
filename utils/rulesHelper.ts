export interface Rule {
  titulo: string;
  texto: string;
}

export const defaultRules: Rule[] = [
  { titulo: 'Seguro Incluso', texto: 'Cobertura para danos leves e desgaste natural.' },
  { titulo: 'Período de Locação', texto: 'Mínimo de 3 dias, máximo de 90 dias.' },
  { titulo: 'Higienização Garantida', texto: 'Todos os produtos são entregues higienizados e revisados.' }
];

/**
 * Parses and returns rules of use for a product.
 * Supports reading from the dedicated 'regras_uso' database field (JSON array)
 * and falls back to extracting rules from a JSON structure in the 'descricao' field.
 */
export const getProductRules = (product: any): Rule[] => {
  if (!product) return defaultRules;

  // 1. Try reading from dedicated regras_uso field if it exists
  if ('regras_uso' in product && product.regras_uso) {
    try {
      const parsed = typeof product.regras_uso === 'string' ? JSON.parse(product.regras_uso) : product.regras_uso;
      if (Array.isArray(parsed)) {
        return parsed.filter((r: any): r is Rule => r && typeof r.titulo === 'string' && typeof r.texto === 'string');
      }
    } catch (e) {
      // Fallback
    }
  }

  // 2. Try parsing from descricao field as fallback
  if (product.descricao) {
    const trimmed = product.descricao.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.regras)) {
          return parsed.regras.filter((r: any): r is Rule => r && typeof r.titulo === 'string' && typeof r.texto === 'string');
        }
      } catch (e) {
        // Fallback
      }
    }
  }

  return defaultRules;
};

/**
 * Returns the description text, supporting both standard plain text
 * and the JSON structures used as fallbacks for multiple rules.
 */
export const getProductDescription = (product: any): string => {
  if (!product) return '';
  if (product.descricao) {
    const trimmed = product.descricao.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && typeof parsed.descricao === 'string') {
          return parsed.descricao;
        }
      } catch (e) {
        // Fallback
      }
    }
    return product.descricao;
  }
  return '';
};
