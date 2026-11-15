import type { Page } from '@playwright/test';
import { maskCard } from '@config/cards';
import { allowRealPayments } from '@config/env';
import { BasePlatform } from '@core/BasePlatform';
import type { PaymentMethod, PaymentMethodType, PaymentResult } from '@core/types';
import { loadCastilloConfig } from './config';
import type { CastilloConfig } from './config';
import { AccountStatementPage } from './pages/AccountStatementPage';
import { CardPaymentPage } from './pages/CardPaymentPage';
import { LoginPage } from './pages/LoginPage';

/** Castillo Country Club monthly maintenance fee (pagoscastillo.com). */
export class CastilloPlatform extends BasePlatform {
  readonly id = 'castillo';
  readonly displayName = 'Castillo';
  readonly supportedMethods: readonly PaymentMethodType[] = ['credit-card'];

  readonly loginPage: LoginPage;
  readonly statementPage: AccountStatementPage;
  readonly cardPage: CardPaymentPage;

  constructor(
    page: Page,
    private readonly config: CastilloConfig = loadCastilloConfig(),
  ) {
    super(page);
    this.loginPage = new LoginPage(page);
    this.statementPage = new AccountStatementPage(page);
    this.cardPage = new CardPaymentPage(page);
  }

  async login(): Promise<void> {
    await this.loginPage.open();
    await this.loginPage.login(this.config.username, this.config.password);
    await this.statementPage.waitUntilLoaded();
  }

  async pay(method: PaymentMethod): Promise<PaymentResult> {
    this.assertSupports(method);

    await this.statementPage.openServicePayments();
    if (!(await this.statementPage.selectAllCharges())) {
      return { platform: this.id, status: 'nothing-due', message: 'No pending charges.' };
    }
    await this.statementPage.continueToCardData();

    await this.cardPage.waitUntilLoaded();
    await this.cardPage.fillCard(method.card);

    if (!allowRealPayments()) {
      return {
        platform: this.id,
        status: 'dry-run',
        message: `Form filled with ${maskCard(method.card)}; "Pagar" not pressed (ALLOW_REAL_PAYMENTS is not true).`,
      };
    }

    const outcome = await this.cardPage.pay();
    return {
      platform: this.id,
      status: outcome.ok ? 'paid' : 'failed',
      message: outcome.message,
    };
  }
}
