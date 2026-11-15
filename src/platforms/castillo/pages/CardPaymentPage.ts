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
 * Card data form: number, holder, Kendo month/year dropdowns, CVV, terms, "Pagar".
 * Locators fall back to the Knockout ids the site uses (creditCardNumber, ...).
 */
export class CardPaymentPage extends BasePage {
  protected readonly path = '/';

  readonly cardNumberInput: Locator = this.byIdOrLabel(
    'creditCardNumber',
    /n[uú]mero de (?:la )?tarjeta/i,
  );
  readonly holderInput: Locator = this.byIdOrLabel('cardHolderName', /nombre|titular/i);
  readonly securityCodeInput: Locator = this.byIdOrLabel(
    'securityCode',
    /c[oó]digo de seguridad|cvv|cvc/i,
  );
  readonly termsCheckbox: Locator = this.page
    .locator('#policyCheck, [name="policyCheck"]')
    .or(this.page.getByRole('checkbox', { name: /t[eé]rminos|condiciones/i }))
    .first();
  readonly payButton: Locator = this.page
    .locator('#payButton')
    .or(this.page.getByRole('button', { name: /^\s*pagar\s*$/i }))
    .first();

  /** Kendo DropDownLists inside the "Fecha de Expiración" group: month first, then year. */
  private readonly expiryDropdowns: Locator = this.page
    .locator('div, fieldset')
    .filter({ hasText: /fecha de expiraci[oó]n/i })
    .filter({ has: this.page.locator('.k-select') })
    .last()
    .locator('.k-dropdown, .k-dropdownlist, .k-picker');

  protected readyIndicator(): Locator {
    return this.cardNumberInput;
  }

  async fillCard(card: CreditCard): Promise<void> {
    await this.cardNumberInput.fill(card.number);
    await this.holderInput.fill(card.holder);
    await this.selectKendoOption(this.expiryDropdowns.nth(0), monthOptionPattern(card.expiryMonth));
    await this.selectKendoOption(this.expiryDropdowns.nth(1), yearOptionPattern(card.expiryYear));
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

  private byIdOrLabel(id: string, label: RegExp): Locator {
    return this.page
      .locator(`#${id}, [name="${id}"], [data-bind*="${id}"]`)
      .or(this.page.getByLabel(label))
      .first();
  }

  /** Opens a Kendo DropDownList with its arrow (.k-select) and picks the matching item. */
  private async selectKendoOption(dropdown: Locator, option: RegExp): Promise<void> {
    await dropdown.locator('.k-select, .k-input-button').first().click();
    // Kendo renders the list in a popup attached to <body>, not inside the dropdown.
    const popup = this.page.locator('.k-animation-container, .k-popup').filter({ visible: true });
    await popup.getByRole('option', { name: option }).first().click();
    // The selected text shows in .k-input (Kendo 2019-) or .k-input-value-text (newer).
    await expect(dropdown.locator('.k-input-value-text, .k-input').first()).toHaveText(option);
  }
}
