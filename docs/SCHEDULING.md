# Scheduling

Not decided yet. The workflow in `.github/workflows/scheduled-payments.yml` can only be started by hand for now, and its `schedule:` block is commented out.

Options to decide on:

- **GitHub Actions cron**: runs in the cloud; needs every `.env` value as a repository secret. Some sites block cloud IPs.
- **Local cron / Task Scheduler** on your own machine: runs from your home network, and secrets stay on your machine.

Whatever is chosen, schedule each platform a few days after its bill is issued, and keep `retries: 0` so nothing is paid twice.
