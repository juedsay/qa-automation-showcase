import { Locator, Page } from '@playwright/test';

export type PaymentMethod =
  | 'bank-transfer'
  | 'cash-on-delivery'
  | 'credit-card'
  | 'buy-now-pay-later'
  | 'gift-card';

/** Steps 2-4 of checkout: sign-in, billing address and payment. */
export class CheckoutPage {
  readonly signedInProceedButton: Locator;
  readonly addressProceedButton: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly postalCode: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.signedInProceedButton = page.getByTestId('proceed-2');
    this.addressProceedButton = page.getByTestId('proceed-3');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.postalCode = page.getByTestId('postal_code');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    // The confirmation block has no test id or role, only a fixed element id. The invoice
    // number inside it cannot be targeted on its own: its <span id> is stripped by
    // Angular's HTML sanitizer, so assertions read the block's text instead.
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  async payWith(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
    // First click validates the payment ("Check payment"), second one places the order ("Confirm").
    await this.finishButton.click();
    await this.paymentSuccess.waitFor();
    await this.finishButton.click();
  }
}
