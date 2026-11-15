# Changelog

## Unreleased

- Castillo (pagoscastillo.com): new platform for the monthly maintenance fee. Username/password login, "Estados y Pagos" > "Pago de Servicios" > "Marcar todos", card form with Kendo month/year dropdowns, terms checkbox and "Pagar". Dry run (stops before "Pagar") unless `ALLOW_REAL_PAYMENTS=true`. New variables `CASTILLO_USERNAME`, `CASTILLO_PASSWORD`, `CASTILLO_PAYMENT_METHOD`, `CASTILLO_CARD`; scripts `castillo` and `castillo:headed`; manual workflow job. Selectors unverified against the live site.
- Tests: new `mock` Playwright project (`npm run test:mock`, also in CI) that runs the Castillo flow against an offline stand-in page, covering dry run, paid and nothing-due.
- Dev tooling: added the `playwright-best-practices` agent skill (`.agents/skills/`, symlinked for Claude Code) and excluded it from Prettier.

## 0.1.0 - 2026-10-19

- Project setup: TypeScript, Playwright, ESLint (strict, type-aware), Prettier, cspell (en/es), CI.
- Page Object Model core: `BasePage`, `BasePlatform`, `PaymentPlatform` contract, platform registry.
- Cards loaded by alias from `.env`; `ALLOW_REAL_PAYMENTS` safety switch.
- Gmail code reader using gmail-getter.
- ESPH: login page object and login flow with emailed code (selectors unverified). Payment pending.
