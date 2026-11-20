import { test as base } from '@playwright/test';
import type { EmailCodeProvider } from '@services/email/EmailCodeProvider';
import { GmailCodeProvider } from '@services/email/GmailCodeProvider';
import { CastilloPlatform } from '@platforms/castillo/CastilloPlatform';
import { ClaroPlatform } from '@platforms/claro/ClaroPlatform';
import { EsphPlatform } from '@platforms/esph/EsphPlatform';

interface Fixtures {
  codes: EmailCodeProvider;
  esph: EsphPlatform;
  castillo: CastilloPlatform;
  claro: ClaroPlatform;
}

export const test = base.extend<Fixtures>({
  codes: async ({}, use) => {
    await use(new GmailCodeProvider());
  },
  esph: async ({ page, codes }, use) => {
    await use(new EsphPlatform(page, codes));
  },
  castillo: async ({ page }, use) => {
    await use(new CastilloPlatform(page));
  },
  claro: async ({ page }, use) => {
    await use(new ClaroPlatform(page));
  },
});

export { expect } from '@playwright/test';
