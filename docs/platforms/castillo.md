# Castillo (pagoscastillo.com)

Castillo Country Club monthly maintenance fee.

- Site: https://www.pagoscastillo.com/
- Login: `CASTILLO_USERNAME` and `CASTILLO_PASSWORD`
- Payment method: credit card (`CASTILLO_CARD` alias)

## Flow

1. Fill the username and password fields and press **Entrar** (`button[type=submit]`).
2. Open **Estados y Pagos** (the element with `title="Estados y Pagos"`).
3. Open **Pago de Servicios**.
4. Press **Marcar todos** (Knockout `click: selectAll`). If **Continuar** does not become enabled (`HasSelectedToPay`) within 10 seconds, there is nothing to pay and `pay()` returns `nothing-due`.
5. Press **Continuar** (`click: goToCreditCardData`).
6. Fill `creditCardNumber`, `cardHolderName`, the **Fecha de Expiración** month and year (Kendo DropDownLists, opened with their `.k-select` arrow) and `securityCode`.
7. Check the terms checkbox (`policyCheck`).
8. **Dry run**: unless `ALLOW_REAL_PAYMENTS=true`, stop here and return `dry-run` without pressing **Pagar**.
9. Press **Pagar** (`payButton`) and wait up to 90 seconds for a success message (`pago realizado`, `transacción aprobada`, `comprobante`, ...) or a failure message (`rechazada`, `denegada`, `error`, ...). Returns `paid` or `failed`.

The expiry dropdowns accept options shown as `7`, `07`, `Julio`, `Jul` or `07 - Julio` for the month and `2030` or `30` for the year (`src/utils/expiryOptions.ts`).

## Running

```bash
npm run test:mock         # offline, against a stand-in page (tests/mock/castilloSite.ts)
npm run castillo:headed   # visible browser, dry run unless ALLOW_REAL_PAYMENTS=true
```

## Status

- Not verified against the live site: the cloud environment cannot reach pagoscastillo.com. Locators use accessible names first and the Knockout ids from the flow description as fallbacks. Run `npm run castillo:headed` once and adjust `src/platforms/castillo/pages/*`.
- The success and failure texts after **Pagar** are guesses. Confirm them on the first real payment.
