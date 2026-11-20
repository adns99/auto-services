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

/** "Otro medio de pago": card number, expiry (MM/YY), CVV, email and "Pagar". */
export class CardPaymentPage extends BasePage {
  protected readonly path = '/';

  readonly cardNumberInput: Locator = this.page.getByTestId(
    'qa_ceCla_servicePay_input_card_number',
  );
  readonly expiryInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_expiration');
  readonly cvvInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_cvv');
  readonly emailInput: Locator = this.page.getByTestId('qa_ceCla_servicePay_input_email');
  readonly payButton: Locator = this.page.locator('#continueButton');

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
   * Presses "Pagar" and waits for the site's success or error message.
   * Never throws for a rejected payment: the site's message comes back in the outcome.
   */
  async pay(): Promise<PaymentOutcome> {
    await expect(this.payButton).toBeEnabled();
    await this.payButton.click();
    const success = this.page.getByText(SUCCESS_TEXT).filter({ visible: true }).first();
    const failure = this.page
      .getByRole('alert')
      .or(this.page.getByText(FAILURE_TEXT))
      .filter({ visible: true, hasText: /\S/ })
      .first();
    try {
      await success.or(failure).first().waitFor({ timeout: CONFIRMATION_TIMEOUT });
    } catch {
      return {
        ok: false,
        message: `No confirmation or error message within ${String(CONFIRMATION_TIMEOUT / 1000)} s after "Pagar". Check the Claro account before running again.`,
      };
    }
    if (await success.isVisible()) {
      return { ok: true, message: (await success.innerText()).trim() };
    }
    const error = (await failure.innerText()).trim();
    return { ok: false, message: `Claro rejected the payment: ${error || 'unknown error'}` };
  }
}
