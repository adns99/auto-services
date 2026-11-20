/** Digits with "." "," or space group separators (a space only before a group of three). */
const NUMBER = String.raw`\d+(?:(?:[.,\u00a0\u202f]| (?=\d{3}(?!\d)))\d+)*`;

/**
 * Parses an amount shown on a payment site into a number.
 *
 * Accepts English and Spanish separators and any currency mark around it:
 * "₡ 34,424.00", "34.424,00", "CRC 34 424", "¢34424" all give 34424.
 * The last "." or "," is read as the decimal separator when both kinds appear, or
 * when it is the only one of its kind and one or two digits follow it.
 */
export function parseAmount(text: string): number {
  const match = new RegExp(NUMBER, 'u').exec(text);
  if (!match) throw new Error(`No amount found in "${text}".`);
  const raw = match[0].replace(/[ \u00a0\u202f]/gu, '');

  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  const decimalAt = Math.max(lastDot, lastComma);
  let integer = raw;
  let fraction = '0';
  if (decimalAt !== -1) {
    const separator = raw.charAt(decimalAt);
    const bothKinds = lastDot !== -1 && lastComma !== -1;
    const onlyOne = raw.indexOf(separator) === decimalAt;
    const tail = raw.slice(decimalAt + 1);
    if (bothKinds || (onlyOne && tail.length <= 2)) {
      integer = raw.slice(0, decimalAt);
      fraction = tail;
    }
  }
  const value = Number(`${integer.replace(/[.,]/g, '')}.${fraction}`);
  if (!Number.isFinite(value)) throw new Error(`Could not read an amount from "${text}".`);
  return value;
}

/**
 * Finds the amount that follows the word "Total" in a block of text, for example
 * "Total - ₡ 34,424.00". "Subtotal" and "Totales" are ignored.
 */
export function parseTotal(text: string): number {
  const match = new RegExp(String.raw`(?<!\p{L})total(?!\p{L})\D*?(${NUMBER})`, 'iu').exec(text);
  if (!match?.[1]) throw new Error(`No "Total" amount found in "${text.trim()}".`);
  return parseAmount(match[1]);
}

/** Formats colones the way Costa Rican sites show them: "₡34,424.00". */
export function formatColones(amount: number): string {
  return `₡${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
