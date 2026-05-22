import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Converte string de data do banco (DATE ou TIMESTAMP) em Date válida. */
export function parseDbDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  // DATE: 2026-05-23 — evita fuso com meio-dia local
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00`);
    return isValid(d) ? d : null;
  }

  const d = parseISO(trimmed);
  return isValid(d) ? d : null;
}

export function formatDbDate(
  value: string | null | undefined,
  pattern: string,
  fallback = '—'
): string {
  const d = parseDbDate(value);
  if (!d) return fallback;
  return format(d, pattern, { locale: ptBR });
}
