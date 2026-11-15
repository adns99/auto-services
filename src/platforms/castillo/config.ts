import { optionalEnv, requireEnv } from '@config/env';

export const CASTILLO_BASE_URL = 'https://www.pagoscastillo.com';
export const CASTILLO_LOGIN_PATH = '/';

export interface CastilloConfig {
  username: string;
  password: string;
  paymentMethod: string;
  cardAlias: string;
}

export function loadCastilloConfig(): CastilloConfig {
  return {
    username: requireEnv('CASTILLO_USERNAME'),
    password: requireEnv('CASTILLO_PASSWORD'),
    paymentMethod: optionalEnv('CASTILLO_PAYMENT_METHOD', 'credit-card'),
    cardAlias: optionalEnv('CASTILLO_CARD', 'MAIN'),
  };
}
