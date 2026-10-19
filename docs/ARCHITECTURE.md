# Architecture

```
src/
  config/         env.ts (reads .env), cards.ts (cards by alias)
  core/           types.ts (PaymentPlatform contract), BasePage.ts, BasePlatform.ts
  services/email/ EmailCodeProvider interface + GmailCodeProvider
  utils/          small pure helpers (extractCode)
  platforms/
    index.ts      registry of platforms by id
    esph/
      config.ts   URLs and ESPH settings from .env
      EsphPlatform.ts
      pages/      one page object per screen (LoginPage, ...)
tests/
  fixtures.ts     Playwright fixtures that build providers and platforms
  unit/           offline tests
  esph/           ESPH flows
```

## Page Object Model across different platforms

Platforms do not share screens, so they do not share page objects. What they share is a contract:

- **`BasePage`**: every page object has a `path` (relative to the platform's `baseURL`), a `readyIndicator()` that proves the page loaded, and `open()`.
- **`PaymentPlatform`** (`src/core/types.ts`): every platform exposes `login()` and `pay(method)` and declares `supportedMethods`. `BasePlatform` adds `assertSupports()`.
- Each platform lives in its own folder with its own page objects, config and Playwright project (own `baseURL`) in `playwright.config.ts`.

Tests and the future scheduler only talk to `PaymentPlatform`, so a new platform never changes existing ones.

## Payment methods

`PaymentMethod` is a union in `src/core/types.ts`. Today it has `credit-card` (a card loaded with `getCard(alias)`). New methods (bank transfer, SINPE, and so on) are added to the union, and each platform lists the ones it supports. Which method and card a bill uses is set per platform in `.env` (for example `ESPH_PAYMENT_METHOD` and `ESPH_CARD`).

## Email codes

Platforms that log in with an emailed code depend on the `EmailCodeProvider` interface, not on Gmail. `GmailCodeProvider` implements it with [gmail-getter](https://www.npmjs.com/package/gmail-getter): it searches with the platform's Gmail query plus `after:<time the code was requested>`, so an old code is never reused, then pulls the code out of the snippet or HTML body.

## Safety

- `retries: 0` and `workers: 1`: a payment is never retried or run twice in parallel.
- `ALLOW_REAL_PAYMENTS` must be `true` before any platform submits a payment.
