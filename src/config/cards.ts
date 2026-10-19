import type { CreditCard } from '@core/types';
import { requireEnv } from './env';

/**
 * Loads a card from the environment by alias.
 * Alias "MAIN" reads CARD_MAIN_HOLDER, CARD_MAIN_NUMBER, CARD_MAIN_EXPIRY_MONTH,
 * CARD_MAIN_EXPIRY_YEAR and CARD_MAIN_CVV.
 */
export function getCard(alias: string): CreditCard {
  const prefix = `CARD_${alias.toUpperCase()}_`;
  return {
    alias,
    holder: requireEnv(`${prefix}HOLDER`),
    number: requireEnv(`${prefix}NUMBER`).replace(/\s+/g, ''),
    expiryMonth: requireEnv(`${prefix}EXPIRY_MONTH`).padStart(2, '0'),
    expiryYear: requireEnv(`${prefix}EXPIRY_YEAR`),
    cvv: requireEnv(`${prefix}CVV`),
  };
}

/** Safe representation of a card for logs and reports. */
export function maskCard(card: CreditCard): string {
  return `${card.alias} (**** ${card.number.slice(-4)})`;
}
