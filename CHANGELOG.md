# Changelog

## Unreleased

- Claro (cr.mipagoclaro.com): new platform for the mobile and internet bill. Looks the bill up by phone number, reads the total ("Total - ₡ 34,424.00"), fills the card form (number, MM/YY, CVV, email) and presses "Pagar", reporting Claro's error message when the payment fails. Dry run unless `ALLOW_REAL_PAYMENTS=true`. Totals above `CLARO_MAX_TOTAL` (default 60000) stop with the new `needs-approval` status until that exact total is approved with `CLARO_APPROVED_TOTAL`. New variables `PHONE_NUMBER`, `CLARO_EMAIL`, `CLARO_PAYMENT_METHOD`, `CLARO_CARD`, `CLARO_MAX_TOTAL`, `CLARO_APPROVED_TOTAL`; scripts `claro` and `claro:headed`; manual workflow job; mock site tests. Selectors unverified against the live site.
- Utils: `parseAmount`/`parseTotal` (English and Spanish separators), `checkSpendingLimit`, and `typeInto` for masked inputs.
- Castillo: fixed the card form against the live site. The card number is a Kendo NumericTextBox whose real input is hidden until focused; expiry dropdowns are now located by their `expirationMonth`/`expirationYear` ids and retried while Kendo popups animate; "Pagar" is the visible one of two `#payButton`s. The mock site now reproduces this markup.
- Castillo (pagoscastillo.com): new platform for the monthly maintenance fee. Username/password login, "Estados y Pagos" > "Pago de Servicios" > "Marcar todos", card form with Kendo month/year dropdowns, terms checkbox and "Pagar". Dry run (stops before "Pagar") unless `ALLOW_REAL_PAYMENTS=true`. New variables `CASTILLO_USERNAME`, `CASTILLO_PASSWORD`, `CASTILLO_PAYMENT_METHOD`, `CASTILLO_CARD`; scripts `castillo` and `castillo:headed`; manual workflow job. Selectors unverified against the live site.
- Tests: new `mock` Playwright project (`npm run test:mock`, also in CI) that runs the Castillo flow against an offline stand-in page, covering dry run, paid and nothing-due.
- CI and scheduled workflows pinned to `ubuntu-24.04`: `ubuntu-latest` is now 26.04, which Playwright 1.56 cannot install browsers for.
- Dev tooling: added the `playwright-best-practices` agent skill (`.agents/skills/`, symlinked for Claude Code) and excluded it from Prettier.

## 0.1.0 - 2026-10-19

- Project setup: TypeScript, Playwright, ESLint (strict, type-aware), Prettier, cspell (en/es), CI.
- Page Object Model core: `BasePage`, `BasePlatform`, `PaymentPlatform` contract, platform registry.
- Cards loaded by alias from `.env`; `ALLOW_REAL_PAYMENTS` safety switch.
- Gmail code reader using gmail-getter.
- ESPH: login page object and login flow with emailed code (selectors unverified). Payment pending.
