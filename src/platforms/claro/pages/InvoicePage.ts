import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import { parseTotal } from '@utils/parseAmount';

/**
 * Loose on purpose: the site says "Saldo de factura por vencer" today, and the
 * wording may change ("Saldo de la factura", "Factura vencida", "Saldo pendiente").
 */
export const BALANCE_TEXT =
  /saldo\s+(?:de\s+(?:la\s+)?)?factura|factura(?:s)?\s+(?:por\s+vencer|vencidas?|pendientes?)|saldo\s+(?:pendiente|por\s+vencer)/i;
export const NOTHING_DUE_TEXT =
  /no\s+(?:tiene|posee|hay|registra|se\s+encontraron)\s+(?:\w+\s+){0,2}(?:saldos?|facturas?|deudas?|pendientes?)|est[aá]\s+al\s+d[ií]a/i;
/** "Total - ₡ 34,424.00"; `\b` keeps "Subtotal" out. */
const TOTAL_TEXT = /\btotal\b[^\d]*\d/i;

export interface InvoiceTotal {
  amount: number;
  text: string;
}

/** Balance shown after looking up the phone number. */
export class InvoicePage extends BasePage {
  protected readonly path = '/';

  readonly balanceHeading: Locator = this.page
    .getByText(BALANCE_TEXT)
    .filter({ visible: true })
    .first();
  readonly nothingDue: Locator = this.page
    .getByText(NOTHING_DUE_TEXT)
    .filter({ visible: true })
    .first();
  readonly total: Locator = this.page.getByText(TOTAL_TEXT).filter({ visible: true }).first();
  /** "Otro medio de pago". */
  readonly payButton: Locator = this.page.getByTestId('invoices__pay-button').first();

  protected readyIndicator(): Locator {
    return this.balanceHeading;
  }

  /** Waits for the balance, or for the site to say there is nothing to pay. */
  async waitForBalance(): Promise<'balance' | 'nothing-due'> {
    await this.balanceHeading.or(this.nothingDue).first().waitFor({ timeout: 60_000 });
    // Checked first: "No tiene facturas pendientes" also matches the loose balance text.
    return (await this.nothingDue.isVisible()) ? 'nothing-due' : 'balance';
  }

  async readTotal(): Promise<InvoiceTotal> {
    await this.total.waitFor({ timeout: 30_000 });
    const text = (await this.total.innerText()).replace(/\s+/g, ' ').trim();
    return { amount: parseTotal(text), text };
  }

  async continueToCardPayment(): Promise<void> {
    await this.payButton.click();
  }
}
