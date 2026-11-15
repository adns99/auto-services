const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches the text of a month option in a card expiry dropdown, whatever the
 * site shows: "7", "07", "Julio", "Jul" or "07 - Julio".
 */
export function monthOptionPattern(month: string): RegExp {
  const value = Number.parseInt(month, 10);
  const name = MONTH_NAMES[value - 1];
  if (name === undefined) throw new Error(`Invalid card expiry month "${month}".`);
  const short = name === 'septiembre' ? 'sept?' : name.slice(0, 3);
  const number = `0?${value}`;
  const label = `${escape(name)}|${short}\\.?`;
  return new RegExp(`^\\s*(?:${number}(?:\\s*[-/]\\s*(?:${label}))?|${label})\\s*$`, 'i');
}

/** Matches the text of a year option: "2030" or "30". */
export function yearOptionPattern(year: string): RegExp {
  const digits = year.trim();
  if (!/^\d{2}(\d{2})?$/.test(digits)) throw new Error(`Invalid card expiry year "${year}".`);
  const short = digits.slice(-2);
  return new RegExp(`^\\s*(?:20)?${short}\\s*$`);
}
