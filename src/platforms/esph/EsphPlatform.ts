import type { Page } from '@playwright/test';
import { BasePlatform } from '@core/BasePlatform';
import type { PaymentMethod, PaymentMethodType, PaymentResult } from '@core/types';
import type { EmailCodeProvider } from '@services/email/EmailCodeProvider';
import { ESPH_PAYMENT_PATH, loadEsphConfig } from './config';
import type { EsphConfig } from './config';
import { LoginPage } from './pages/LoginPage';

/** Empresa de Servicios Públicos de Heredia (esph-sa.com). */
export class EsphPlatform extends BasePlatform {
  readonly id = 'esph';
  readonly displayName = 'ESPH';
  readonly supportedMethods: readonly PaymentMethodType[] = ['credit-card'];

  readonly loginPage: LoginPage;

  constructor(
    page: Page,
    private readonly codes: EmailCodeProvider,
    private readonly config: EsphConfig = loadEsphConfig(),
  ) {
    super(page);
    this.loginPage = new LoginPage(page);
  }

  async login(): Promise<void> {
    await this.loginPage.open();
    await this.loginPage.enterEmail(this.config.email);
    const requestedAt = await this.loginPage.requestCode();
    const code = await this.codes.waitForCode({
      query: this.config.codeEmailQuery,
      receivedAfter: requestedAt,
    });
    await this.loginPage.submitCode(code);
    await this.page.waitForURL((url) => url.pathname.startsWith(ESPH_PAYMENT_PATH));
  }

  pay(method: PaymentMethod): Promise<PaymentResult> {
    this.assertSupports(method);
    // Pending: the payment flow will be built together with Adrian.
    return Promise.reject(new Error('ESPH payment flow is not implemented yet.'));
  }
}
