export const DEFAULT_CODE_PATTERN = /\b(\d{4,8})\b/;

/** Removes tags, styles and scripts so codes can be matched in plain text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the first match of the pattern in the given texts, in order. */
export function extractCode(
  texts: string[],
  pattern: RegExp = DEFAULT_CODE_PATTERN,
): string | null {
  for (const text of texts) {
    const match = pattern.exec(text);
    if (match) return match[1] ?? match[0];
  }
  return null;
}
