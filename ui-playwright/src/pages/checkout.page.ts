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
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.signedInProceedButton = page.getByTestId('proceed-2');
    this.addressProceedButton = page.getByTestId('proceed-3');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    // The confirmation block has no test id or role, only a fixed element id. The invoice
    // number inside it cannot be targeted on its own: its <span id> is stripped by
    // Angular's HTML sanitizer, so assertions read the block's text instead.
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  /** Steps 2-4 for a customer who is already signed in, keeping the prefilled billing address. */
  async completeAsSignedInCustomer(method: PaymentMethod): Promise<void> {
    await this.signedInProceedButton.click();
    await this.addressProceedButton.click();
    await this.payWith(method);
  }

  /** Reads the invoice number from the order confirmation ("... invoice number is INV-123."). */
  async invoiceNumber(): Promise<string> {
    const text = await this.orderConfirmation.textContent();
    const match = text?.match(/INV-\d+/);
    if (!match) throw new Error(`No invoice number in confirmation: "${text}"`);
    return match[0];
  }

  async payWith(method: PaymentMethod): Promise<void> {
    await this.paymentMethod.selectOption(method);
    // First click validates the payment ("Check payment"), second one places the order ("Confirm").
    await this.finishButton.click();
    await this.paymentSuccess.waitFor();
    await this.finishButton.click();
  }
}
