# Changelog

## Unreleased

- Dev tooling: added the `playwright-best-practices` agent skill (`.agents/skills/`, symlinked for Claude Code) and excluded it from Prettier.

## 0.1.0 - 2026-10-19

- Project setup: TypeScript, Playwright, ESLint (strict, type-aware), Prettier, cspell (en/es), CI.
- Page Object Model core: `BasePage`, `BasePlatform`, `PaymentPlatform` contract, platform registry.
- Cards loaded by alias from `.env`; `ALLOW_REAL_PAYMENTS` safety switch.
- Gmail code reader using gmail-getter.
- ESPH: login page object and login flow with emailed code (selectors unverified). Payment pending.
