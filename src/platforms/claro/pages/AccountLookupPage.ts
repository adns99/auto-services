import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import { typeInto } from '@utils/typeInto';
import { CLARO_HOME_PATH } from '../config';

/**
 * Home page of cr.mipagoclaro.com: pick "mobile number", type it, press "Aceptar".
 * Selectors come from the live page (ids and data-testids given by Adrian).
 */
export class AccountLookupPage extends BasePage {
  protected readonly path = CLARO_HOME_PATH;

  readonly mobileOption: Locator = this.page.locator('#MobileNumber');
  private readonly mobileOptionLabel: Locator = this.page.locator('label[for="MobileNumber"]');
  readonly phoneInput: Locator = this.page.locator('#phone__input');
  readonly acceptButton: Locator = this.page.getByTestId('accept-button');

  protected readyIndicator(): Locator {
    return this.mobileOption.or(this.mobileOptionLabel).filter({ visible: true }).first();
  }

  async selectMobile(): Promise<void> {
    // Styled radios often hide the real <input>; click its label in that case.
    await expect(async () => {
      if (await this.mobileOption.isVisible()) await this.mobileOption.check({ timeout: 2_000 });
      else await this.mobileOptionLabel.first().click({ timeout: 2_000 });
      await expect(this.mobileOption).toBeChecked({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  }

  async lookUp(phoneNumber: string): Promise<void> {
    await this.selectMobile();
    await typeInto(this.phoneInput, phoneNumber);
    await expect(this.acceptButton).toBeEnabled();
    await this.acceptButton.click();
  }
}
