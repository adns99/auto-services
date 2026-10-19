import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import { ESPH_LOGIN_PATH } from '../config';

/**
 * ESPH login: enter email, click "Obtener código", then enter the emailed code.
 *
 * Selectors are written from the flow description and have not been checked
 * against the live page yet (see docs/platforms/esph.md). Each one prefers the
 * accessible name and falls back to common Drupal attributes.
 */
export class LoginPage extends BasePage {
  protected readonly path = ESPH_LOGIN_PATH;

  readonly emailInput: Locator = this.page
    .getByRole('textbox', { name: /correo|e-?mail/i })
    .or(this.page.locator('input[type="email"], input[name="mail"], input[name="name"]'))
    .first();

  readonly getCodeButton: Locator = this.page.getByRole('button', { name: /obtener c[oó]digo/i });

  readonly codeInput: Locator = this.page
    .getByRole('textbox', { name: /c[oó]digo/i })
    .or(
      this.page.locator(
        'input[name*="code" i], input[name*="codigo" i], input[autocomplete="one-time-code"]',
      ),
    )
    .first();

  readonly submitButton: Locator = this.page.getByRole('button', {
    name: /ingresar|iniciar sesi[oó]n|entrar|verificar|log ?in/i,
  });

  protected readyIndicator(): Locator {
    return this.emailInput;
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    // The button is disabled until a valid email is filled in.
    await expect(this.getCodeButton).toBeEnabled();
  }

  /** Clicks "Obtener código" and returns the time it was requested. */
  async requestCode(): Promise<Date> {
    const requestedAt = new Date();
    await this.getCodeButton.click();
    await this.codeInput.waitFor({ state: 'visible' });
    return requestedAt;
  }

  async submitCode(code: string): Promise<void> {
    await this.codeInput.fill(code);
    await this.submitButton.click();
  }
}
