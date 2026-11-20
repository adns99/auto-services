import { optionalEnv, requireEnv } from '@config/env';
import { parseAmount } from '@utils/parseAmount';
import type { SpendingLimit } from '@utils/spendingLimit';

export const CLARO_BASE_URL = 'https://cr.mipagoclaro.com';
export const CLARO_HOME_PATH = '/';
export const CLARO_DEFAULT_MAX_TOTAL = 100_000;
export const CLARO_APPROVE_VARIABLE = 'CLARO_APPROVED_TOTAL';

export interface ClaroConfig {
  phoneNumber: string;
  email: string;
  paymentMethod: string;
  cardAlias: string;
  limit: SpendingLimit;
}

function optionalAmount(name: string): number | undefined {
  const value = process.env[name]?.trim();
  return value ? parseAmount(value) : undefined;
}

export function loadClaroConfig(): ClaroConfig {
  return {
    phoneNumber: requireEnv('PHONE_NUMBER').replace(/\D/g, ''),
    email: requireEnv('CLARO_EMAIL'),
    paymentMethod: optionalEnv('CLARO_PAYMENT_METHOD', 'credit-card'),
    cardAlias: optionalEnv('CLARO_CARD', 'MAIN'),
    limit: {
      max: optionalAmount('CLARO_MAX_TOTAL') ?? CLARO_DEFAULT_MAX_TOTAL,
      approvedTotal: optionalAmount(CLARO_APPROVE_VARIABLE),
    },
  };
}
