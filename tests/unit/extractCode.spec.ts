import { expect, test } from '@playwright/test';
import { extractCode, htmlToText } from '@utils/extractCode';

test.describe('extractCode', () => {
  test('finds a numeric code in the snippet', () => {
    expect(extractCode(['Su código de acceso es 482913. Vence en 10 minutos.'])).toBe('482913');
  });

  test('falls back to the next text when the first has no code', () => {
    expect(extractCode(['Hola', 'Código: 5521'])).toBe('5521');
  });

  test('supports a custom pattern', () => {
    expect(extractCode(['Code: AB12CD'], /Code: ([A-Z0-9]{6})/)).toBe('AB12CD');
  });

  test('returns null when there is no code', () => {
    expect(extractCode(['No code here'])).toBeNull();
  });

  test('strips html before matching', () => {
    const html = '<style>.x{color:#123456}</style><p>Su código es <b>7788</b></p>';
    expect(extractCode([htmlToText(html)])).toBe('7788');
  });
});
