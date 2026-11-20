import { expect, test } from '@playwright/test';
import { formatColones, parseAmount, parseTotal } from '@utils/parseAmount';
import { checkSpendingLimit } from '@utils/spendingLimit';

test.describe('parseAmount', () => {
  test('reads English and Spanish separators', () => {
    expect(parseAmount('₡ 34,424.00')).toBe(34424);
    expect(parseAmount('₡34.424,50')).toBe(34424.5);
    expect(parseAmount('CRC 100 000')).toBe(100000);
    expect(parseAmount('100,000')).toBe(100000);
    expect(parseAmount('1.234.567')).toBe(1234567);
    expect(parseAmount('¢34424')).toBe(34424);
    expect(parseAmount('34424.5')).toBe(34424.5);
  });

  test('fails when there is no number', () => {
    expect(() => parseAmount('₡ --')).toThrow(/No amount/);
  });
});

test.describe('parseTotal', () => {
  test('reads the amount after "Total"', () => {
    expect(parseTotal('Total - ₡ 34,424.00')).toBe(34424);
    expect(parseTotal('TOTAL: ₡34.424,00')).toBe(34424);
    expect(parseTotal('Total -\n₡ 34,424.00\nOtro medio de pago')).toBe(34424);
  });

  test('skips "Subtotal" and stops at the end of the number', () => {
    expect(parseTotal('Subtotal ₡ 1.00 Total - ₡ 34,424.00 2 facturas')).toBe(34424);
  });

  test('fails without a total', () => {
    expect(() => parseTotal('Subtotal ₡ 1.00')).toThrow(/No "Total"/);
  });
});

test('formatColones', () => {
  expect(formatColones(34424)).toBe('₡34,424.00');
});

test.describe('checkSpendingLimit', () => {
  const variable = 'CLARO_APPROVED_TOTAL';

  test('allows totals up to the limit', () => {
    expect(checkSpendingLimit(60_000, { max: 60_000 }, variable).ok).toBe(true);
  });

  test('blocks a total above the limit and says how to approve it', () => {
    const decision = checkSpendingLimit(134_424, { max: 60_000 }, variable);
    expect(decision.ok).toBe(false);
    expect(decision.message).toContain('exceeds the ₡60,000.00 limit');
    expect(decision.message).toContain('CLARO_APPROVED_TOTAL=134424');
  });

  test('allows only the exact total the user approved', () => {
    expect(checkSpendingLimit(134_424, { max: 60_000, approvedTotal: 134_424 }, variable).ok).toBe(
      true,
    );
    const other = checkSpendingLimit(150_000, { max: 60_000, approvedTotal: 134_424 }, variable);
    expect(other.ok).toBe(false);
    expect(other.message).toContain('does not match');
  });
});
