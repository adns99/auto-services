# Gmail setup (reading login codes)

The automation reads codes through the Gmail API with [gmail-getter](https://www.npmjs.com/package/gmail-getter). It only needs read access to your inbox.

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project.
2. Enable the [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com).
3. Configure the OAuth consent screen and add your Gmail address as a test user.
4. In [Credentials](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID** of type **Desktop app** and download it.
5. Rename the download to `credentials.json` and put it in the repo root (it is gitignored).
6. Run `npm run gmail:token`, sign in, and copy the refresh token it prints.
7. Put the client id, client secret and refresh token in `.env` as `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` and `GMAIL_REFRESH_TOKEN`. You can delete `credentials.json` afterwards.

Notes:

- While the consent screen is in "Testing" mode Google expires refresh tokens after about 7 days. Publishing the app (it stays private to you) avoids that; otherwise rerun step 6 when the login starts failing with an auth error.
- Each platform sets its own search query (for ESPH, `ESPH_CODE_EMAIL_QUERY`). Narrow it with `subject:` once the real email is known.
