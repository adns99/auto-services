# ESPH (esph-sa.com)

- Login: https://www.esph-sa.com/user/login?destination=/tramites/pago-en-linea
- Payment page: `/tramites/pago-en-linea`
- Payment method: credit card (`ESPH_CARD` alias)

## Login flow

1. Fill the email field. The **Obtener código** button stays disabled until a valid email is entered.
2. Click **Obtener código**. ESPH emails a one-time code.
3. `GmailCodeProvider` waits for an email matching `ESPH_CODE_EMAIL_QUERY` received after the click and extracts the code.
4. Fill the code and submit. Login succeeds when the browser lands on `/tramites/pago-en-linea`.

## Status

- Login: written but **not verified against the live page**. The selectors in `pages/LoginPage.ts` use accessible names (`correo`, `Obtener código`, `código`, `Ingresar`) with Drupal attribute fallbacks. Run `npm run esph:headed` once and adjust them.
- Code email: sender, subject and code format unknown. Defaults: `from:esph-sa.com` and 4-8 digits.
- Payment: not built. `EsphPlatform.pay()` throws until the flow is defined.
