import type { CreditCardPayment } from '@core/types';
import { ClaroPlatform } from '@platforms/claro/ClaroPlatform';
import type { ClaroConfig } from '@platforms/claro/config';
import { CLARO_BASE_URL } from '@platforms/claro/config';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockClaroSite } from './claroSite';

const config: ClaroConfig = {
  phoneNumber: '88887777',
  email: 'me@example.com',
  paymentMethod: 'credit-card',
  cardAlias: 'TEST',
  limit: { max: 60_000 },
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

const clicks = (page: Page): Promise<{ pay: number; confirm: number }> =>
  page.evaluate(() => {
    const counts = window as unknown as { payClicks: number; confirmClicks: number };
    return { pay: counts.payClicks, confirm: counts.confirmClicks };
  });
const payClicks = async (page: Page): Promise<number> => (await clicks(page)).pay;

test.use({ baseURL: CLARO_BASE_URL });

test.describe('Claro flow against a mock site', () => {
  test.afterEach(() => {
    delete process.env.ALLOW_REAL_PAYMENTS;
  });

  test('dry run types the phone, fills the card form and never presses Pagar', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'false';
    await mockClaroSite(page);
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    await expect(page.locator('#MobileNumber')).toBeChecked();
    const result = await claro.pay(method);

    expect(result).toMatchObject({ status: 'dry-run', amount: '₡34,424.00' });
    await expect(claro.cardPage.cardNumberInput).toHaveValue('4111111111111111');
    await expect(claro.cardPage.expiryInput).toHaveValue('07/30');
    await expect(claro.cardPage.cvvInput).toHaveValue('123');
    await expect(claro.cardPage.emailInput).toHaveValue('me@example.com');
    expect(await payClicks(page)).toBe(0);
  });

  test('pays and checks the receipt when real payments are allowed', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page);
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result).toMatchObject({
      status: 'paid',
      amount: '₡34,424.00',
      reference: '383983',
      message: '¡Gracias por tu pago! Transaction APROBADA, authorization 383983.',
    });
    expect(await clicks(page)).toEqual({ pay: 1, confirm: 1 });
  });

  test('stops before paying when the total is above the limit', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { total: '134,424.00' });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result.status).toBe('needs-approval');
    expect(result.message).toContain('CLARO_APPROVED_TOTAL=134424');
    await expect(claro.invoicePage.payButton).toBeVisible();
    expect(await payClicks(page)).toBe(0);
  });

  test('pays a total above the limit when the user approved that total', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { total: '134,424.00' });
    const claro = new ClaroPlatform(page, {
      ...config,
      limit: { max: 60_000, approvedTotal: 134_424 },
    });

    await claro.login();
    const result = await claro.pay(method);

    expect(result).toMatchObject({ status: 'paid', amount: '₡134,424.00' });
  });

  test('reports the error Claro shows right after Pagar', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { decline: 'pay' });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result.status).toBe('failed');
    expect(result.message).toContain('Tarjeta inválida, verifique los datos');
    expect(await clicks(page)).toEqual({ pay: 1, confirm: 0 });
  });

  test('reports the error Claro shows after Continuar', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { decline: 'confirm' });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result.status).toBe('failed');
    expect(result.message).toContain('Transacción rechazada por el banco emisor');
    expect(await clicks(page)).toEqual({ pay: 1, confirm: 1 });
  });

  test('fails when the receipt is not marked APROBADA', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { status: 'PENDIENTE' });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result.status).toBe('failed');
    expect(result.message).toContain('not marked APROBADA');
  });

  test('flags a receipt amount that differs from the total', async ({ page }) => {
    process.env.ALLOW_REAL_PAYMENTS = 'true';
    await mockClaroSite(page, { paid: '30,000.00' });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result).toMatchObject({ status: 'paid', amount: '₡30,000.00' });
    expect(result.message).toContain('receipt shows ₡30,000.00 paid, not the ₡34,424.00 total');
  });

  test('returns nothing-due when there is no pending bill', async ({ page }) => {
    await mockClaroSite(page, { pending: false });
    const claro = new ClaroPlatform(page, config);

    await claro.login();
    const result = await claro.pay(method);

    expect(result.status).toBe('nothing-due');
  });
});
