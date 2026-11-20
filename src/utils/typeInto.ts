import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

const digits = (text: string): string => text.replace(/\D/g, '');

/**
 * Types a value into an input that may have a mask (phone, card number, "MM/YY").
 * Tries `fill()` first; if the field does not end up holding the same digits
 * (masks often drop pasted text), clears it and types key by key.
 * Compares digits only, so the mask's spaces, dashes and slashes do not matter.
 */
export async function typeInto(input: Locator, value: string): Promise<void> {
  const expected = digits(value) || value;
  const holds = async (): Promise<boolean> => {
    const current = await input.inputValue();
    return (digits(value) ? digits(current) : current) === expected;
  };

  await input.click();
  await input.fill(value);
  if (await holds()) return;

  await input.clear();
  await input.pressSequentially(digits(value) || value, { delay: 50 });
  await expect
    .poll(holds, { message: 'the field should hold the typed value', timeout: 5_000 })
    .toBe(true);
}
