import { formatColones } from './parseAmount';

export interface SpendingLimit {
  /** Highest total paid without asking. */
  max: number;
  /**
   * A total above `max` that the user approved for this bill. The bill is paid only when
   * its total matches it exactly, so an old approval never covers a different bill.
   */
  approvedTotal?: number;
}

export type LimitDecision = { ok: true; message?: string } | { ok: false; message: string };

/** Decides whether a bill total may be paid under the limit or with the user's approval. */
export function checkSpendingLimit(
  total: number,
  limit: SpendingLimit,
  approveVariable: string,
): LimitDecision {
  if (total <= limit.max) return { ok: true };
  if (limit.approvedTotal !== undefined && Math.abs(total - limit.approvedTotal) < 0.005) {
    return {
      ok: true,
      message: `Total ${formatColones(total)} is above the ${formatColones(limit.max)} limit; paying because ${approveVariable} approves it.`,
    };
  }
  const approved =
    limit.approvedTotal === undefined
      ? ''
      : ` ${approveVariable}=${String(limit.approvedTotal)} does not match this total.`;
  return {
    ok: false,
    message:
      `Total ${formatColones(total)} exceeds the ${formatColones(limit.max)} limit, so nothing was paid. ` +
      `Check the bill, and if it is correct set ${approveVariable}=${String(total)} and run again.${approved}`,
  };
}
