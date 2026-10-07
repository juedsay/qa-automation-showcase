import { Locator, Page } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly addedToCartToast: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantityInput = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addedToCartToast = page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) {
      await this.quantityInput.fill(String(quantity));
    }
    await this.addToCartButton.click();
  }
}
