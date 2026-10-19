import { defineConfig, devices } from '@playwright/test';
import { envFlag } from './src/config/env';
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
    {
      name: 'esph',
      testDir: './tests/esph',
      use: { ...devices['Desktop Chrome'], baseURL: ESPH_BASE_URL },
    },
  ],
});
