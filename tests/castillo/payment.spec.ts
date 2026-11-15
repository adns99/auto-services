import { getCard, maskCard } from '@config/cards';
import { hasEnv } from '@config/env';
import { loadCastilloConfig } from '@platforms/castillo/config';
import { expect, test } from '../fixtures';

test.describe('Castillo maintenance fee', () => {
  test.skip(
    !hasEnv('CASTILLO_USERNAME', 'CASTILLO_PASSWORD'),
    'Castillo credentials are not set in .env',
  );

  test('logs in', async ({ castillo }) => {
    await castillo.login();
    await expect(castillo.statementPage.statementsMenu).toBeVisible();
  });

  test('pays the pending charges by card', async ({ castillo }) => {
    const card = getCard(loadCastilloConfig().cardAlias);
    test.info().annotations.push({ type: 'card', description: maskCard(card) });

    await castillo.login();
    const result = await castillo.pay({ type: 'credit-card', card });
    test.info().annotations.push({
      type: 'result',
      description: `${result.status}: ${result.message ?? ''}`,
    });

    // dry-run unless ALLOW_REAL_PAYMENTS=true; nothing-due when there are no pending charges.
    expect(['paid', 'dry-run', 'nothing-due'], result.message).toContain(result.status);
  });
});
