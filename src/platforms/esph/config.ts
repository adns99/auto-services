import { optionalEnv, requireEnv } from '@config/env';

export const ESPH_BASE_URL = 'https://www.esph-sa.com';
export const ESPH_PAYMENT_PATH = '/tramites/pago-en-linea';
export const ESPH_LOGIN_PATH = `/user/login?destination=${ESPH_PAYMENT_PATH}`;

export interface EsphConfig {
  email: string;
  codeEmailQuery: string;
  paymentMethod: string;
  cardAlias: string;
}

export function loadEsphConfig(): EsphConfig {
  return {
    email: requireEnv('ESPH_EMAIL'),
    codeEmailQuery: optionalEnv('ESPH_CODE_EMAIL_QUERY', 'from:esph-sa.com'),
    paymentMethod: optionalEnv('ESPH_PAYMENT_METHOD', 'credit-card'),
    cardAlias: optionalEnv('ESPH_CARD', 'MAIN'),
  };
}
