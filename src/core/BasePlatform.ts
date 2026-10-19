import type { Page } from '@playwright/test';
import type { PaymentMethod, PaymentMethodType, PaymentPlatform, PaymentResult } from './types';

export abstract class BasePlatform implements PaymentPlatform {
  abstract readonly id: string;
  abstract readonly displayName: string;
  abstract readonly supportedMethods: readonly PaymentMethodType[];

  constructor(protected readonly page: Page) {}

  abstract login(): Promise<void>;
  abstract pay(method: PaymentMethod): Promise<PaymentResult>;

  protected assertSupports(method: PaymentMethod): void {
    if (!this.supportedMethods.includes(method.type)) {
      throw new Error(`${this.displayName} does not support payment method "${method.type}".`);
    }
  }
}
