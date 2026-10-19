export interface CodeRequest {
  /** Provider-specific search, e.g. a Gmail query like "from:esph-sa.com". */
  query: string;
  /** Only emails received at or after this moment are considered. */
  receivedAfter: Date;
  /** Regex whose first capture group is the code. Defaults to 4-8 digits. */
  pattern?: RegExp;
  timeoutMs?: number;
}

/** Anything that can fetch a one-time login code sent by email. */
export interface EmailCodeProvider {
  waitForCode(request: CodeRequest): Promise<string>;
}
