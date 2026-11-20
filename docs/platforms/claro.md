# Claro (cr.mipagoclaro.com)

Claro Costa Rica mobile and internet bill, looked up by phone number. There is no account login.

- Site: https://cr.mipagoclaro.com/
- Lookup: `PHONE_NUMBER` (the Claro mobile number; spaces and dashes are ignored)
- Payment method: credit card (`CLARO_CARD` alias), receipt sent to `CLARO_EMAIL`
- Spending limit: `CLARO_MAX_TOTAL` (default 60000 colones), approve a higher bill with `CLARO_APPROVED_TOTAL`

## Flow

1. Open the home page and select the **mobile number** radio (`#MobileNumber`; its label is clicked when the styled radio hides the input).
2. Type `PHONE_NUMBER` into `#phone__input`. The value is filled, and if the input's mask drops it, typed key by key. The run checks that the field holds the same digits before going on.
3. Press **Aceptar** (`data-testid="accept-button"`).
4. Wait up to 60 seconds for the balance. The heading is matched loosely so a wording change does not break the run: `Saldo de factura por vencer`, `Saldo de la factura`, `Factura vencida`, `Saldo pendiente`, and so on (`BALANCE_TEXT` in `src/platforms/claro/pages/InvoicePage.ts`). If the site says there is nothing to pay (`No tiene facturas pendientes`, `está al día`, ...), `pay()` returns `nothing-due`.
5. Read the total from the text after the word **Total**, for example `Total - ₡ 34,424.00` (`parseTotal` in `src/utils/parseAmount.ts`). It reads `34,424.00`, `34.424,00` and `34424`, and skips `Subtotal`.
6. **Spending limit**: if the total is above `CLARO_MAX_TOTAL`, stop without paying and return `needs-approval` with a warning such as:

   > Total ₡134,424.00 exceeds the ₡60,000.00 limit, so nothing was paid. Check the bill, and if it is correct set CLARO_APPROVED_TOTAL=134424 and run again.

   The run fails with that message so it shows in the report. To pay that bill, set `CLARO_APPROVED_TOTAL` to the total and run again. The approval only covers that exact total, so a later, different bill above the limit is stopped again. Remove it once the bill is paid.

7. Press **Otro medio de pago** (`data-testid="invoices__pay-button"`).
8. Fill the card form: card number (`qa_ceCla_servicePay_input_card_number`), expiry as `MM/YY` (`qa_ceCla_servicePay_input_expiration`), CVV (`qa_ceCla_servicePay_input_cvv`) and `CLARO_EMAIL` (`qa_ceCla_servicePay_input_email`). Masked fields are checked the same way as the phone number.
9. **Dry run**: unless `ALLOW_REAL_PAYMENTS=true`, stop here and return `dry-run` without pressing **Pagar**.
10. Press **Pagar** (`#continueButton` with the text "Pagar") and wait up to 90 seconds for the next step's **Continuar** button, or for an error (an `alert`, `rechazada`, `denegada`, `inválida`, `fondos insuficientes`, `error`, ...).
11. Press **Continuar** (also `#continueButton`, `type="button"`, told apart from **Pagar** by its text) and wait up to 90 seconds for the receipt or an error.
12. Check the receipt (`/MPC/PaymentStatus/<id>`, `src/platforms/claro/pages/PaymentStatusPage.ts`). Two parts are required: the title **¡Gracias por tu pago!** (also accepts "su pago") and **APROBADA** next to "Transacción". The run also reads **Número de autorización** (returned as the result's `reference`) and **Monto pagado** (returned as `amount`) when they are there. Results:
    - `paid`: title and APROBADA shown. If **Monto pagado** differs from the bill total, the message adds a warning.
    - `failed`: Claro showed an error after **Pagar** or **Continuar**, the receipt is not marked APROBADA within 10 seconds, or nothing showed within 90 seconds. The message says which, includes Claro's own text, and is also printed to the console.

## Running

```bash
npm run test:mock      # offline, against a stand-in page (tests/mock/claroSite.ts)
npm run claro:headed   # visible browser, dry run unless ALLOW_REAL_PAYMENTS=true
```

## Status

- Selectors come from Adrian's description of the live site (2026-11-20) and have not been run against it yet: the cloud environment cannot reach cr.mipagoclaro.com. Run `npm run claro:headed` (dry run) once to confirm.
- If the card form turns out to be inside an iframe, the card page object needs a `frameLocator`.
- The receipt texts were confirmed from a real payment on 2026-11-20. The error texts after **Pagar** and **Continuar** are still guesses.
- With several pending bills the first **Total** on the page is used.
