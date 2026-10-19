# Notes for contributors (human or AI)

- Keep docs current: any change to behavior, config or platforms updates README.md, the matching file in docs/, .env.example (for new variables) and CHANGELOG.md in the same commit.
- Never commit `.env`, real card data or credentials. Log cards only with `maskCard()`.
- Never submit a real payment unless `allowRealPayments()` is true.
- Run `npm run check` and `npm run test:unit` before committing.
