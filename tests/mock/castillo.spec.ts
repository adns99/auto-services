import type { CreditCardPayment } from '@core/types';
import { CastilloPlatform } from '@platforms/castillo/CastilloPlatform';
import { CASTILLO_BASE_URL } from '@platforms/castillo/config';
import { expect, test } from '@playwright/test';
import { mockCastilloSite } from './castilloSite';

const config = {
  username: 'user',
  password: 'secret',
  paymentMethod: 'credit-card',
  cardAlias: 'TEST',
};
const method: CreditCardPayment = {
  type: 'credit-card',
  card: {
    alias: 'TEST',
    holder: 'NOMBRE APELLIDO',
    number: '4111111111111111',
    expiryMonth: '07',
    expiryYear: '2030',
    cvv: '123',
  },
};

test.use({ baseURL: CASTILLO_BASE_URL });

test.describe('Castillo flow against a mock site', () => {
  test.afterEach(() => {
    delete process.env.ALLOW_REAL_PAYMENTS;
  });

  test('dry run fills the form and never presses Pagar', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'false';
    await mockCastilloSite(page);
    const castillo = new CastilloPlatform(page, config);

    await castillo.login();
    const result = await castillo.pay(method);

    expect(result.status).toBe('dry-run');
    await expect(page.locator('#month')).toContainText('07');
    await expect(page.locator('#year')).toContainText('2030');
    await expect(page.locator('#policyCheck')).toBeChecked();
    expect(await page.evaluate(() => (window as unknown as { payClicks: number }).payClicks)).toBe(
      0,
    );
  });

  test('pays and reads the success message when real payments are allowed', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockCastilloSite(page);
    const castillo = new CastilloPlatform(page, config);

    await castillo.login();
    const result = await castillo.pay(method);

    expect(result).toMatchObject({ status: 'paid', message: 'Pago realizado con éxito' });
  });

  test('returns nothing-due when there are no pending charges', async ({ page }) => {
    await mockCastilloSite(page, { pending: false });
    const castillo = new CastilloPlatform(page, config);

    await castillo.login();
    const result = await castillo.pay(method);

    expect(result.status).toBe('nothing-due');
  });
});
