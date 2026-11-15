# Auto-services

Playwright + TypeScript automation that pays monthly bills on several payment platforms, each with the payment method chosen for that bill.

| Platform                     | Login                                        | Payment                                                | Docs                                                     |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| ESPH (esph-sa.com)           | Email code via Gmail (selectors unverified)  | Not built yet                                          | [docs/platforms/esph.md](docs/platforms/esph.md)         |
| Castillo (pagoscastillo.com) | Username and password (selectors unverified) | Credit card, dry-run by default (selectors unverified) | [docs/platforms/castillo.md](docs/platforms/castillo.md) |

## Quick start

```bash
npm install
cp .env.example .env    # then fill in real values
npm run check           # typecheck, lint, format, spelling
npm run test:unit       # offline tests
npm run test:mock       # platform flows against offline stand-in pages
npm run esph:headed     # ESPH login with a visible browser
npm run castillo:headed # Castillo login + payment form (dry run) with a visible browser
```

Real payments are never submitted unless `ALLOW_REAL_PAYMENTS=true` is set in `.env`. Without it, platforms fill the payment form and stop before the final pay button (a dry run).

## Scripts

| Script                                 | What it does                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run check`                        | Runs `typecheck`, `lint`, `format:check` and `spell`                             |
| `npm run typecheck`                    | TypeScript compile check (`tsc --noEmit`)                                        |
| `npm run lint` / `lint:fix`            | ESLint (typescript-eslint strict + Playwright rules), zero warnings allowed      |
| `npm run format`                       | Prettier                                                                         |
| `npm run spell`                        | cspell, English and Spanish dictionaries                                         |
| `npm run test:unit`                    | Unit tests, no browser or credentials needed                                     |
| `npm run esph` / `esph:headed`         | ESPH flow, headless or visible                                                   |
| `npm run castillo` / `castillo:headed` | Castillo flow, headless or visible                                               |
| `npm run gmail:token`                  | Generates a Gmail refresh token (see [docs/GMAIL_SETUP.md](docs/GMAIL_SETUP.md)) |
| `npm run report`                       | Opens the last Playwright HTML report                                            |

## Documentation

- [Architecture](docs/ARCHITECTURE.md): folders, Page Object Model, how platforms plug in
- [Configuration](docs/CONFIGURATION.md): every `.env` variable
- [Gmail setup](docs/GMAIL_SETUP.md): reading login codes from email
- [Adding a platform](docs/ADDING_A_PLATFORM.md)
- [Scheduling](docs/SCHEDULING.md): not decided yet
- [Changelog](CHANGELOG.md)

## Security

- `.env`, `credentials.json` and Playwright reports are gitignored. Never commit them.
- Log cards only through `maskCard()` (last four digits).
- Traces and screenshots are kept only on failure and may show account pages, so treat `test-results/` as private.
