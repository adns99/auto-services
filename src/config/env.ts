import { config } from 'dotenv';

config({ quiet: true });

/** Reads a required environment variable, failing fast with a clear message. */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable "${name}". See .env.example.`);
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() ?? fallback;
}

export function envFlag(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export function hasEnv(...names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

/** Real payments are only submitted when ALLOW_REAL_PAYMENTS=true. */
export const allowRealPayments = (): boolean => envFlag('ALLOW_REAL_PAYMENTS');
