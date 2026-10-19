import { hasEnv } from '@config/env';
import { ESPH_PAYMENT_PATH } from '@platforms/esph/config';
import { expect, test } from '../fixtures';

test.describe('ESPH login', () => {
  test.skip(
    !hasEnv('ESPH_EMAIL', 'GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'),
    'ESPH and Gmail credentials are not set in .env',
  );

  test('logs in with the emailed code', async ({ esph, page }) => {
    await esph.login();
    await expect(page).toHaveURL(new RegExp(ESPH_PAYMENT_PATH));
  });
});
