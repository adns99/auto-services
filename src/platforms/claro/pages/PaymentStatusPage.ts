import type { Locator } from '@playwright/test';
import { BasePage } from '@core/BasePage';
import { parseAmount } from '@utils/parseAmount';

/** "¡Gracias por tu pago!"; also accepts "su pago" in case the wording changes. */
export const RECEIPT_TITLE = /gracias por (?:tu|su) pago/i;
const APPROVED = /\baprobad[ao]\b/i;
const APPROVAL_TIMEOUT = 10_000;

export interface Receipt {
  approved: boolean;
  title: string;
  /** "Número de autorización". */
  authorization?: string;
  /** "Monto pagado", in colones. */
  amountPaid?: number;
}

/**
 * Receipt shown after "Continuar" (/MPC/PaymentStatus/<id>):
 * "¡Gracias por tu pago!", then "Transacción: APROBADA", "Monto pagado: ₡ 34,424.00",
 * "Número de autorización: 383983". Only the title and APROBADA are required;
 * the other fields are read when present.
 */
export class PaymentStatusPage extends BasePage {
  protected readonly path = '/';

  readonly title: Locator = this.page.getByText(RECEIPT_TITLE).filter({ visible: true }).first();
  readonly approved: Locator = this.page.getByText(APPROVED).filter({ visible: true }).first();

  protected readyIndicator(): Locator {
    return this.title;
  }

  async read(): Promise<Receipt> {
    const title = (await this.title.innerText()).trim();
    let approved = true;
    try {
      await this.approved.waitFor({ timeout: APPROVAL_TIMEOUT });
    } catch {
      approved = false;
    }
    const text = await this.page.locator('body').innerText();
    const authorization = /autorizaci[oó]n\s*:?\s*([A-Z0-9-]+)/i.exec(text)?.[1];
    const amountText = /monto\s+pagado\s*:?\s*([^\n]*\d[^\n]*)/i.exec(text)?.[1];
    return {
      approved,
      title,
      authorization,
      amountPaid: amountText ? parseAmount(amountText) : undefined,
    };
  }
}
