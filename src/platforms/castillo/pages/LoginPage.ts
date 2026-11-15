import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import { CASTILLO_LOGIN_PATH } from '../config';

/**
 * Castillo login: username, password, then the "Entrar" submit button.
 *
 * Not checked against the live page yet (see docs/platforms/castillo.md).
 * Each locator prefers the accessible name and falls back to attributes.
 */
export class LoginPage extends BasePage {
  protected readonly path = CASTILLO_LOGIN_PATH;

  readonly usernameInput: Locator = this.page
    .getByRole('textbox', { name: /usuario|username|c[eé]dula|correo/i })
    .or(this.page.locator('input[name="username" i], input[id="username" i]'))
    .first();

  readonly passwordInput: Locator = this.page
    .getByLabel(/contrase[nñ]a|clave|password/i)
    .or(this.page.locator('input[type="password"]'))
    .first();

  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Entrar' });

  protected readyIndicator(): Locator {
    return this.usernameInput;
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
