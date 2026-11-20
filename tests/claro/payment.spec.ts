import { getCard, maskCard } from '@config/cards';
import { hasEnv } from '@config/env';
import { loadClaroConfig } from '@platforms/claro/config';
import { expect, test } from '../fixtures';

test.describe('Claro mobile and internet bill', () => {
  test.skip(
    !hasEnv('PHONE_NUMBER', 'CLARO_EMAIL'),
    'PHONE_NUMBER and CLARO_EMAIL are not set in .env',
  );

  test('pays the pending bill by card', async ({ claro }) => {
    const card = getCard(loadClaroConfig().cardAlias);
    test.info().annotations.push({ type: 'card', description: maskCard(card) });

    await claro.login();
    const result = await claro.pay({ type: 'credit-card', card });
    test.info().annotations.push({
      type: 'result',
      description: `${result.status}${result.amount ? ` ${result.amount}` : ''}: ${result.message ?? ''}`,
    });

    // dry-run unless ALLOW_REAL_PAYMENTS=true; nothing-due when there is no pending bill.
    // needs-approval (total above CLARO_MAX_TOTAL) and failed (Claro's error) fail the run
    // with the message, so they show in the report.
    expect(['paid', 'dry-run', 'nothing-due'], result.message).toContain(result.status);
  });
});
