import { Locator, Page } from '@playwright/test';

/** Step 1 of checkout: the shopping cart. */
export class CartPage {
  readonly productTitles: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;
  readonly proceedButton: Locator;

  constructor(private readonly page: Page) {
    this.productTitles = page.getByTestId('product-title');
    this.total = page.getByTestId('cart-total');
    this.emptyMessage = page.getByText('The cart is empty. Nothing to display.');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  row(productName: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ has: this.page.getByTestId('product-title').filter({ hasText: productName }) });
  }

  quantityOf(productName: string): Locator {
    return this.page.getByLabel(`Quantity for ${productName}`);
  }

  linePriceOf(productName: string): Locator {
    return this.row(productName).getByTestId('line-price');
  }

  async setQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.quantityOf(productName);
    await input.fill(String(quantity));
    // The app recalculates on the native `change` event, which fires on blur.
    await input.blur();
  }

  async remove(productName: string): Promise<void> {
    // The delete control is an icon-only <a> without href or accessible name,
    // so there is no role/label/test-id to target. Class selector scoped to the row.
    await this.row(productName).locator('a.btn-danger').click();
  }
}
