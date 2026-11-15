import { expect, test } from '@playwright/test';
import { monthOptionPattern, yearOptionPattern } from '@utils/expiryOptions';

test.describe('monthOptionPattern', () => {
  test('matches numbers with or without a leading zero', () => {
    const pattern = monthOptionPattern('07');
    expect(pattern.test('7')).toBe(true);
    expect(pattern.test('07')).toBe(true);
    expect(pattern.test('17')).toBe(false);
  });

  test('matches Spanish month names and abbreviations', () => {
    expect(monthOptionPattern('7').test('Julio')).toBe(true);
    expect(monthOptionPattern('7').test('jul')).toBe(true);
    expect(monthOptionPattern('9').test('Sept.')).toBe(true);
    expect(monthOptionPattern('12').test('07 - Diciembre')).toBe(false);
    expect(monthOptionPattern('12').test('12 - Diciembre')).toBe(true);
  });

  test('rejects an invalid month', () => {
    expect(() => monthOptionPattern('13')).toThrow(/Invalid/);
  });
});

test.describe('yearOptionPattern', () => {
  test('matches four and two digit years', () => {
    expect(yearOptionPattern('2030').test('2030')).toBe(true);
    expect(yearOptionPattern('2030').test('30')).toBe(true);
    expect(yearOptionPattern('30').test('2030')).toBe(true);
    expect(yearOptionPattern('2030').test('2031')).toBe(false);
  });

  test('rejects an invalid year', () => {
    expect(() => yearOptionPattern('20301')).toThrow(/Invalid/);
  });
});
