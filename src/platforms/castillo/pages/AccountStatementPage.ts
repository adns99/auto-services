import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';

/**
 * "Estados y Pagos" > "Pago de Servicios": the list of pending charges.
 * The page uses Knockout bindings (selectAll, HasSelectedToPay), kept as fallbacks.
 */
export class AccountStatementPage extends BasePage {
  protected readonly path = '/';

  readonly statementsMenu: Locator = this.page.getByTitle('Estados y Pagos').first();

  readonly servicePaymentTab: Locator = this.page
    .getByRole('link', { name: /pago de servicios/i })
    .or(this.page.getByRole('tab', { name: /pago de servicios/i }))
    .or(this.page.getByRole('button', { name: /pago de servicios/i }))
    .or(this.page.getByText(/pago de servicios/i))
    .first();

  readonly selectAllButton: Locator = this.page
    .locator('[data-bind*="selectAll"]')
    .or(this.page.getByRole('button', { name: /marcar todos/i }))
    .or(this.page.getByRole('checkbox', { name: /marcar todos/i }))
    .first();

  readonly continueButton: Locator = this.page
    .locator('[data-bind*="goToCreditCardData"]')
    .or(this.page.getByRole('button', { name: /continuar/i }))
    .first();

  protected readyIndicator(): Locator {
    return this.statementsMenu;
  }

  async openServicePayments(): Promise<void> {
    await this.statementsMenu.click();
    await this.servicePaymentTab.click();
    await this.selectAllButton.waitFor({ state: 'visible' });
  }

  /** Selects every pending charge. Returns false when nothing can be paid. */
  async selectAllCharges(): Promise<boolean> {
    await this.selectAllButton.click();
    try {
      // "Continuar" is only enabled when something is selected (HasSelectedToPay).
      await this.continueButton.and(this.page.locator(':enabled')).waitFor({ timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }

  async continueToCardData(): Promise<void> {
    await this.continueButton.click();
  }
}
