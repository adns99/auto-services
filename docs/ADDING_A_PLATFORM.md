# Adding a platform

1. Create `src/platforms/<id>/` with:
   - `config.ts`: base URL, paths, and a `load<Id>Config()` reading `<ID>_*` variables.
   - `pages/`: one class per screen extending `BasePage`. Prefer `getByRole` / `getByLabel` locators.
   - `<Id>Platform.ts`: extends `BasePlatform`, declares `supportedMethods`, implements `login()` and `pay()`. Check `allowRealPayments()` before the final submit.
2. Register it in `src/platforms/index.ts`.
3. Add a fixture in `tests/fixtures.ts` and specs in `tests/<id>/`.
4. Add a Playwright project in `playwright.config.ts` with its `baseURL`.
5. Add its variables to `.env.example` and `docs/CONFIGURATION.md`.
6. Add `docs/platforms/<id>.md` and a row in the README platform table.
7. Add a `CHANGELOG.md` entry, then run `npm run check`.
