import { Locator, Page } from '@playwright/test';

/** My account > Invoices: the customer's order history table. */
export class InvoicesPage {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/account/invoices');
  }

  rowFor(invoiceNumber: string): Locator {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: invoiceNumber, exact: true }) });
  }
}
