import { defineConfig, devices } from '@playwright/test';
import { envFlag } from './src/config/env';
import { CASTILLO_BASE_URL } from './src/platforms/castillo/config';
import { ESPH_BASE_URL } from './src/platforms/esph/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // never retry a payment automatically
  workers: 1,
  timeout: 3 * 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: envFlag('HEADLESS', true),
    locale: 'es-CR',
    timezoneId: 'America/Costa_Rica',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'unit', testDir: './tests/unit' },
    // Platform flows against local stand-in pages, offline.
    { name: 'mock', testDir: './tests/mock', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'esph',
      testDir: './tests/esph',
      use: { ...devices['Desktop Chrome'], baseURL: ESPH_BASE_URL },
    },
    {
      name: 'castillo',
      testDir: './tests/castillo',
      use: { ...devices['Desktop Chrome'], baseURL: CASTILLO_BASE_URL },
    },
  ],
});
