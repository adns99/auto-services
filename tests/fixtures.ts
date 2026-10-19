import { test as base } from '@playwright/test';
import type { EmailCodeProvider } from '@services/email/EmailCodeProvider';
import { GmailCodeProvider } from '@services/email/GmailCodeProvider';
import { EsphPlatform } from '@platforms/esph/EsphPlatform';

interface Fixtures {
  codes: EmailCodeProvider;
  esph: EsphPlatform;
}

export const test = base.extend<Fixtures>({
  codes: async ({}, use) => {
    await use(new GmailCodeProvider());
  },
  esph: async ({ page, codes }, use) => {
    await use(new EsphPlatform(page, codes));
  },
});

export { expect } from '@playwright/test';
