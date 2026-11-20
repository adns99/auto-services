import type { Page } from '@playwright/test';
import { maskCard } from '@config/cards';
import { allowRealPayments } from '@config/env';
import { BasePlatform } from '@core/BasePlatform';
import type { PaymentMethod, PaymentMethodType, PaymentResult } from '@core/types';
import { formatColones } from '@utils/parseAmount';
import { checkSpendingLimit } from '@utils/spendingLimit';
import { CLARO_APPROVE_VARIABLE, loadClaroConfig } from './config';
import type { ClaroConfig } from './config';
import { AccountLookupPage } from './pages/AccountLookupPage';
import { CardPaymentPage } from './pages/CardPaymentPage';
import { InvoicePage } from './pages/InvoicePage';

/** Claro mobile and internet bill (cr.mipagoclaro.com), looked up by phone number. */
export class ClaroPlatform extends BasePlatform {
  readonly id = 'claro';
  readonly displayName = 'Claro';
  readonly supportedMethods: readonly PaymentMethodType[] = ['credit-card'];

  readonly lookupPage: AccountLookupPage;
  readonly invoicePage: InvoicePage;
  readonly cardPage: CardPaymentPage;

  constructor(
    page: Page,
    private readonly config: ClaroConfig = loadClaroConfig(),
  ) {
    super(page);
    this.lookupPage = new AccountLookupPage(page);
    this.invoicePage = new InvoicePage(page);
    this.cardPage = new CardPaymentPage(page);
  }

  /** There is no account login: the bill is found by phone number. */
  async login(): Promise<void> {
    await this.lookupPage.open();
    await this.lookupPage.lookUp(this.config.phoneNumber);
  }

  async pay(method: PaymentMethod): Promise<PaymentResult> {
    this.assertSupports(method);

    if ((await this.invoicePage.waitForBalance()) === 'nothing-due') {
      return { platform: this.id, status: 'nothing-due', message: 'No pending Claro bill.' };
    }

    const total = await this.invoicePage.readTotal();
    const amount = formatColones(total.amount);
    const decision = checkSpendingLimit(total.amount, this.config.limit, CLARO_APPROVE_VARIABLE);
    if (!decision.ok) {
      console.warn(`[claro] ${decision.message}`);
      return { platform: this.id, status: 'needs-approval', amount, message: decision.message };
    }
    if (decision.message) console.warn(`[claro] ${decision.message}`);

    await this.invoicePage.continueToCardPayment();
    await this.cardPage.waitUntilLoaded();
    await this.cardPage.fillCard(method.card, this.config.email);

    if (!allowRealPayments()) {
      return {
        platform: this.id,
        status: 'dry-run',
        amount,
        message: `Total ${amount}. Form filled with ${maskCard(method.card)}; "Pagar" not pressed (ALLOW_REAL_PAYMENTS is not true).`,
      };
    }

    const outcome = await this.cardPage.pay();
    if (!outcome.ok) {
      console.error(`[claro] ${outcome.message}`);
      return { platform: this.id, status: 'failed', amount, message: outcome.message };
    }

    // Paid either way; a different "Monto pagado" is flagged so it gets a look.
    let message = outcome.message;
    if (outcome.amountPaid !== undefined && Math.abs(outcome.amountPaid - total.amount) >= 0.005) {
      message += ` Warning: the receipt shows ${formatColones(outcome.amountPaid)} paid, not the ${amount} total.`;
      console.warn(`[claro] ${message}`);
    }
    return {
      platform: this.id,
      status: 'paid',
      amount: outcome.amountPaid === undefined ? amount : formatColones(outcome.amountPaid),
      reference: outcome.authorization,
      message,
    };
  }
}
