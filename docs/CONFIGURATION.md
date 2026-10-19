# Configuration

All settings live in `.env` (gitignored). Copy `.env.example` and fill it in.

| Variable                    | Required              | Description                                                      |
| --------------------------- | --------------------- | ---------------------------------------------------------------- |
| `HEADLESS`                  | no                    | `false` shows the browser. Default `true`.                       |
| `ALLOW_REAL_PAYMENTS`       | no                    | Must be `true` for any payment to be submitted. Default `false`. |
| `GMAIL_CLIENT_ID`           | for email-code logins | OAuth client id ([Gmail setup](GMAIL_SETUP.md))                  |
| `GMAIL_CLIENT_SECRET`       | for email-code logins | OAuth client secret                                              |
| `GMAIL_REFRESH_TOKEN`       | for email-code logins | From `npm run gmail:token`                                       |
| `CARD_<ALIAS>_HOLDER`       | per card              | Name on the card                                                 |
| `CARD_<ALIAS>_NUMBER`       | per card              | Card number, spaces allowed                                      |
| `CARD_<ALIAS>_EXPIRY_MONTH` | per card              | `1`-`12`                                                         |
| `CARD_<ALIAS>_EXPIRY_YEAR`  | per card              | Four digits                                                      |
| `CARD_<ALIAS>_CVV`          | per card              | Security code                                                    |
| `ESPH_EMAIL`                | for ESPH              | Email registered on esph-sa.com                                  |
| `ESPH_PAYMENT_METHOD`       | no                    | Default `credit-card`                                            |
| `ESPH_CARD`                 | no                    | Card alias to pay ESPH with. Default `MAIN`                      |
| `ESPH_CODE_EMAIL_QUERY`     | no                    | Gmail search for the code email. Default `from:esph-sa.com`      |

Add more cards by repeating the `CARD_<ALIAS>_*` block with another alias (for example `CARD_VISA_*`) and pointing a platform at it.
