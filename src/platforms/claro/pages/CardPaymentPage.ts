import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import type { CreditCard } from '@core/types';
import { typeInto } from '@utils/typeInto';

const SUCCESS_TEXT =
  /pago (?:realizado|exitoso|aplicado|procesado|aprobado)|transacci[oó]n (?:exitosa|aprobada)|gracias por su pago|comprobante/i;
const FAILURE_TEXT =
  /rechazad[oa]|denegad[oa]|declinad[oa]|inv[aá]lid[oa]|no (?:se pudo|fue posible)|fondos insuficientes|error/i;
const CONFIRMATION_TIMEOUT = 90_000;

export type PaymentOutcome = { ok: true; message: string } | { ok: false; message: string };

/** "Otro medio de pago": card number, expiry (MM/YY), CVV, email, "Pagar" and "Continuar". */
export class CardPaymentPage extends BasePage {
  protected readonly path = '/';

  readonly cardNumberInput: Locator = this.page.getByTestId(
    'qa_ceCla_servicePay_input_card_number',
  );
  readonly expiryInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_expiration');
  readonly cvvInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_cvv');
  readonly emailInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_email');
  /** "Pagar" and the following "Continuar" are both `#continueButton`. */
  readonly payButton: Locator = this.page
    .locator('#continueButton')
    .filter({ hasText: /pagar/i, visible: true })
    .first();
  readonly confirmButton: Locator = this.page
    .locator('#continueButton')
    .filter({ hasText: /continuar/i, visible: true })
    .first();
  private readonly success: Locator = this.page
    .getByText(SUCCESS_TEXT)
    .filter({ visible: true })
    .first();
  private readonly failure: Locator = this.page
    .getByRole('alert')
    .or(this.page.getByText(FAILURE_TEXT))
    .filter({ visible: true, hasText: /\S/ })
    .first();

  protected readyIndicator(): Locator {
    return this.cardNumberInput;
  }

  async fillCard(card: CreditCard, email: string): Promise<void> {
    await typeInto(this.cardNumberInput, card.number);
    await typeInto(this.expiryInput, `${card.expiryMonth}/${card.expiryYear.slice(-2)}`);
    await typeInto(this.cvvInput, card.cvv);
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
  }

  /**
   * Presses "Pagar", then the "Continuar" button the site shows next, and waits for
   * the success or error message. Both buttons are `#continueButton`, told apart by text.
   * Never throws for a rejected payment: the site's message comes back in the outcome.
   */
  async pay(): Promise<PaymentOutcome> {
    await expect(this.payButton).toBeEnabled();
    await this.payButton.click();

    // An error (declined card, bad data) can show instead of "Continuar".
    if (!(await this.waitFor(this.confirmButton.or(this.failure).first(), 'Pagar'))) {
      return this.timedOut('Pagar');
    }
    if (!(await this.confirmButton.isVisible())) return this.rejected();
    const successBeforeConfirm = await this.successText();
    await this.confirmButton.click();

    if (!(await this.waitFor(this.success.or(this.failure).first(), 'Continuar'))) {
      // Some sites show the receipt with "Continuar" and then leave it.
      return successBeforeConfirm
        ? { ok: true, message: successBeforeConfirm }
        : this.timedOut('Continuar');
    }
    const message = await this.successText();
    return message ? { ok: true, message } : this.rejected();
  }

  private async waitFor(target: Locator, after: string): Promise<boolean> {
    try {
      await target.waitFor({ timeout: CONFIRMATION_TIMEOUT });
      return true;
    } catch {
      console.warn(`[claro] nothing happened within the time limit after "${after}"`);
      return false;
    }
  }

  private async successText(): Promise<string | undefined> {
    if (!(await this.success.isVisible())) return undefined;
    return (await this.success.innerText()).trim();
  }

  private async rejected(): Promise<PaymentOutcome> {
    const error = (await this.failure.innerText()).trim();
    return { ok: false, message: `Claro rejected the payment: ${error || 'unknown error'}` };
  }

  private timedOut(after: string): PaymentOutcome {
    return {
      ok: false,
      message: `No confirmation or error message within ${String(CONFIRMATION_TIMEOUT / 1000)} s after "${after}". Check the Claro account before running again.`,
    };
  }
}
