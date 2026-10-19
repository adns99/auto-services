import { checkInbox, getAccessToken, parseHtmlFromEmail } from 'gmail-getter';
import type { Email } from 'gmail-getter';
import { requireEnv } from '@config/env';
import { extractCode, htmlToText } from '@utils/extractCode';
import type { CodeRequest, EmailCodeProvider } from './EmailCodeProvider';

/** Allowed difference between this machine's clock and Gmail's. */
const CLOCK_SKEW_SECONDS = 30;

/** Reads one-time codes from Gmail using the Gmail API (via gmail-getter). */
export class GmailCodeProvider implements EmailCodeProvider {
  private accessToken?: string;

  constructor(
    private readonly clientId = requireEnv('GMAIL_CLIENT_ID'),
    private readonly clientSecret = requireEnv('GMAIL_CLIENT_SECRET'),
    private readonly refreshToken = requireEnv('GMAIL_REFRESH_TOKEN'),
  ) {}

  async waitForCode({
    query,
    receivedAfter,
    pattern,
    timeoutMs = 90_000,
  }: CodeRequest): Promise<string> {
    const token = await this.token();
    const afterSeconds = Math.floor(receivedAfter.getTime() / 1000) - CLOCK_SKEW_SECONDS;
    // gmail-getter types say Email, but it resolves null when nothing arrives in time.
    const email = (await checkInbox({
      token,
      query: `${query} after:${afterSeconds}`,
      timeout: timeoutMs,
      step: 3_000,
      logs: false,
    })) as Email | null;

    if (!email) {
      throw new Error(`No email matching "${query}" arrived within ${timeoutMs / 1000}s.`);
    }

    const code = extractCode([email.snippet, this.bodyText(email)], pattern);
    if (!code) {
      throw new Error(`Found an email matching "${query}" but no code in it.`);
    }
    return code;
  }

  private async token(): Promise<string> {
    this.accessToken ??= await getAccessToken(this.clientId, this.clientSecret, this.refreshToken);
    return this.accessToken;
  }

  private bodyText(email: Email): string {
    try {
      return htmlToText(parseHtmlFromEmail(email));
    } catch {
      return '';
    }
  }
}
