import { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartToast: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addedToCartToast = page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
