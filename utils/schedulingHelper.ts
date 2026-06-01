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

const DEFAULT_RETIRADA_HORA = '09:00';
const DEFAULT_DEVOLUCAO_HORA = '18:00';

/** Garante HH:MM válido para colunas TIME do Postgres (rejeita string vazia). */
export function normalizeTime(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const getProductEntregaHoraInicio = (product: any): string => {
  if (product) {
    const fromColumn = normalizeTime(product.entrega_hora_inicio, '');
    if (fromColumn) return fromColumn;

    if (product.descricao) {
      const trimmed = product.descricao.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            const fromJson = normalizeTime(parsed.entrega_hora_inicio, '');
            if (fromJson) return fromJson;
          }
        } catch {
          // fallback abaixo
        }
      }
    }
  }
  return DEFAULT_RETIRADA_HORA;
};

export const getProductEntregaHoraFim = (product: any): string => {
  if (product) {
    const fromColumn = normalizeTime(product.entrega_hora_fim, '');
    if (fromColumn) return fromColumn;

    if (product.descricao) {
      const trimmed = product.descricao.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            const fromJson = normalizeTime(parsed.entrega_hora_fim, '');
            if (fromJson) return fromJson;
          }
        } catch {
          // fallback abaixo
        }
      }
    }
  }
  return DEFAULT_DEVOLUCAO_HORA;
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
