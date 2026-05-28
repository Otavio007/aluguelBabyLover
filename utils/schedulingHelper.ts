export const ALL_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const WEEKDAY_DISPLAY: Record<string, string> = {
  Dom: 'Domingo',
  Seg: 'Segunda',
  Ter: 'Terça',
  Qua: 'Quarta',
  Qui: 'Quinta',
  Sex: 'Sexta',
  Sáb: 'Sábado',
};

export const getWeekdayDisplay = (abbr: string): string => WEEKDAY_DISPLAY[abbr] ?? abbr;

export const getProductDevolucaoDias = (product: any): string[] => {
  if (product) {
    if (product.devolucao_dias) {
      try {
        const parsed = typeof product.devolucao_dias === 'string' ? JSON.parse(product.devolucao_dias) : product.devolucao_dias;
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Try parsing from description JSON fallback
    if (product.descricao) {
      const trimmed = product.descricao.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.devolucao_dias)) {
            return parsed.devolucao_dias;
          }
        } catch (e) {
          // Fallback
        }
      }
    }
  }
  return ALL_WEEKDAYS; // Default is all days
};

export const getProductEntregaHoraInicio = (product: any): string => {
  if (product) {
    if (product.entrega_hora_inicio) return product.entrega_hora_inicio;

    // Try parsing from description JSON fallback
    if (product.descricao) {
      const trimmed = product.descricao.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && typeof parsed.entrega_hora_inicio === 'string') {
            return parsed.entrega_hora_inicio;
          }
        } catch (e) {
          // Fallback
        }
      }
    }
  }
  return '08:00';
};

export const getProductEntregaHoraFim = (product: any): string => {
  if (product) {
    if (product.entrega_hora_fim) return product.entrega_hora_fim;

    // Try parsing from description JSON fallback
    if (product.descricao) {
      const trimmed = product.descricao.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && typeof parsed.entrega_hora_fim === 'string') {
            return parsed.entrega_hora_fim;
          }
        } catch (e) {
          // Fallback
        }
      }
    }
  }
  return '18:00';
};

/**
 * Format a Date object or YYYY-MM-DD string to DD/MM/YYYY
 */
export const formatDateToBR = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr + 'T12:00:00') : dateStr;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Convert DD/MM/YYYY string to YYYY-MM-DD
 */
export const parseBRDateToISO = (brDateStr: string): string => {
  if (!brDateStr) return '';
  const parts = brDateStr.split('/');
  if (parts.length !== 3) return '';
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = parts[2];
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a given Date or YYYY-MM-DD string is a valid return day for the product
 */
export const isValidReturnDate = (product: any, dateStr: string): boolean => {
  if (!dateStr) return true;
  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return true;
  
  const allowedDays = getProductDevolucaoDias(product);
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayName = ALL_WEEKDAYS[dayIndex];
  return allowedDays.includes(dayName);
};

/**
 * Generates time slots in 30-minute intervals between start and end times
 */
export const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  try {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      const hh = String(currentHour).padStart(2, '0');
      const mm = String(currentMin).padStart(2, '0');
      slots.push(`${hh}:${mm}`);

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = 0;
      }
    }
  } catch (e) {
    // Fallback if formatting is invalid
    return ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  }

  return slots.length > 0 ? slots : ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
};
