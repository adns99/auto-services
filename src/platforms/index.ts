import type { Page } from '@playwright/test';
import type { PaymentPlatform } from '@core/types';
import type { EmailCodeProvider } from '@services/email/EmailCodeProvider';
import { CastilloPlatform } from './castillo/CastilloPlatform';
import { ClaroPlatform } from './claro/ClaroPlatform';
import { EsphPlatform } from './esph/EsphPlatform';

export interface PlatformDeps {
  page: Page;
  codes: EmailCodeProvider;
}

/** Every supported platform, by id. Register new platforms here. */
export const platforms = {
  esph: ({ page, codes }: PlatformDeps): PaymentPlatform => new EsphPlatform(page, codes),
  castillo: ({ page }: PlatformDeps): PaymentPlatform => new CastilloPlatform(page),
  claro: ({ page }: PlatformDeps): PaymentPlatform => new ClaroPlatform(page),
} as const;

export type PlatformId = keyof typeof platforms;
