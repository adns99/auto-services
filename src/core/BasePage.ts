import type { Locator, Page } from '@playwright/test';

/** Shared behavior for every page object, on every platform. */
export abstract class BasePage {
  /** Path relative to the platform's baseURL. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitUntilLoaded();
  }

  /** Each page decides which element proves it has finished loading. */
  protected abstract readyIndicator(): Locator;

  async waitUntilLoaded(): Promise<void> {
    await this.readyIndicator().waitFor({ state: 'visible' });
  }
}
