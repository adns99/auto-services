# Scheduling

Not decided yet. The workflow in `.github/workflows/scheduled-payments.yml` can only be started by hand for now, and its `schedule:` block is commented out.

Options to decide on:

- **GitHub Actions cron**: runs in the cloud; needs every `.env` value as a repository secret. Some sites block cloud IPs.
- **Local cron / Task Scheduler** on your own machine: runs from your home network, and secrets stay on your machine.

Whatever is chosen, schedule each platform a few days after its bill is issued, and keep `retries: 0` so nothing is paid twice.

The manual workflow reads the Claro values from the `payments` environment: secrets `PHONE_NUMBER` and `CLARO_EMAIL` (plus the `CARD_MAIN_*` secrets), and optional variables `CLARO_MAX_TOTAL` and `CLARO_APPROVED_TOTAL`. A scheduled Claro bill above the limit stops with `needs-approval` until `CLARO_APPROVED_TOTAL` is set to that total.
