import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import type { CreditCard } from '@core/types';
import { monthOptionPattern, yearOptionPattern } from '@utils/expiryOptions';

const SUCCESS_TEXT =
  /pago (?:realizado|exitoso|aplicado|procesado)|transacci[oó]n (?:exitosa|aprobada)|aprobad[oa]|comprobante/i;
const FAILURE_TEXT = /rechazad[oa]|denegad[oa]|declinad[oa]|no (?:se pudo|fue posible)|error/i;

export type PaymentOutcome = { ok: true; message: string } | { ok: false; message: string };

/**
 * Card data form (Kendo UI 2019 widgets):
 * - `#creditCardNumber` is a Kendo NumericTextBox. The real input stays hidden
 *   until focused; a sibling `.k-formatted-value` input is what the user sees.
 * - `#expirationMonth` / `#expirationYear` are hidden <select>s behind Kendo
 *   DropDownLists; the widget wrapper has `aria-owns="<id>_listbox"` and the
 *   popup list is `#<id>_listbox`, attached to <body>.
 * - There are two `#payButton`s (desktop and phone layouts); only one is visible.
 */
export class CardPaymentPage extends BasePage {
  protected readonly path = '/';

  private readonly cardNumberWidget: Locator = this.page
    .locator('.k-numerictextbox')
    .filter({ has: this.page.locator('#creditCardNumber') });
  readonly cardNumberInput: Locator = this.page.locator('#creditCardNumber');
  readonly holderInput: Locator = this.page.locator('#cardHolderName');
  readonly securityCodeInput: Locator = this.page.locator('#securityCode');
  readonly termsCheckbox: Locator = this.page.locator('#policyCheck');
  readonly payButton: Locator = this.page.locator('#payButton').filter({ visible: true }).first();

  protected readyIndicator(): Locator {
    return this.cardNumberWidget;
  }

  async fillCard(card: CreditCard): Promise<void> {
    await this.fillCardNumber(card.number);
    await this.holderInput.fill(card.holder);
    await this.selectKendoOption('expirationMonth', monthOptionPattern(card.expiryMonth));
    await this.selectKendoOption('expirationYear', yearOptionPattern(card.expiryYear));
    await this.securityCodeInput.fill(card.cvv);
    await this.termsCheckbox.check();
    await expect(this.payButton).toBeEnabled();
  }

  /** Presses "Pagar" and waits for the site's success or failure message. */
  async pay(): Promise<PaymentOutcome> {
    await this.payButton.click();
    const success = this.page.getByText(SUCCESS_TEXT).filter({ visible: true }).first();
    const failure = this.page.getByText(FAILURE_TEXT).filter({ visible: true }).first();
    await success.or(failure).first().waitFor({ state: 'visible', timeout: 90_000 });
    if (await success.isVisible()) {
      return { ok: true, message: (await success.innerText()).trim() };
    }
    return { ok: false, message: (await failure.innerText()).trim() };
  }

  /**
   * Focusing the visible formatted input makes Kendo swap in the real input;
   * Tab blurs it so Kendo parses the value and updates the view model.
   */
  private async fillCardNumber(number: string): Promise<void> {
    await this.cardNumberWidget.locator('.k-formatted-value').click();
    await this.cardNumberInput.fill(number);
    await this.cardNumberInput.press('Tab');
    await expect(this.cardNumberInput).toHaveValue(number);
  }

  /**
   * Opens the Kendo DropDownList that wraps `<select id>` and picks the matching item.
   * Kendo animates its popups and closes one that is opened while another is still
   * closing, so open-and-pick is retried until the widget shows the choice.
   */
  private async selectKendoOption(id: string, option: RegExp): Promise<void> {
    const widget = this.page.locator(`[aria-owns="${id}_listbox"]`);
    const list = this.page.locator(`#${id}_listbox`);
    const item = list.locator('[role="option"]').filter({ hasText: option }).first();
    await expect(async () => {
      if (!(await list.isVisible())) await widget.click();
      await item.click({ timeout: 3_000 });
      await expect(widget.locator('.k-input')).toHaveText(option, { timeout: 1_000 });
    }).toPass({ timeout: 20_000 });
    await expect(list).toBeHidden();
  }
}
