/** Payment methods a platform may support. Add new ones here as platforms need them. */
export type PaymentMethodType = 'credit-card';

export interface CreditCard {
  alias: string;
  holder: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CreditCardPayment {
  type: 'credit-card';
  card: CreditCard;
}

export type PaymentMethod = CreditCardPayment;

export interface PaymentResult {
  platform: string;
  status: 'paid' | 'nothing-due' | 'dry-run' | 'failed';
  amount?: string;
  reference?: string;
  message?: string;
}

/**
 * Contract every payment platform implements. Each platform keeps its own
 * page objects under src/platforms/<id>/ and only exposes these steps.
 */
export interface PaymentPlatform {
  readonly id: string;
  readonly displayName: string;
  readonly supportedMethods: readonly PaymentMethodType[];
  login(): Promise<void>;
  pay(method: PaymentMethod): Promise<PaymentResult>;
}
