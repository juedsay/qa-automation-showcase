import { Locator, Page } from '@playwright/test';
import { Customer } from '../data/customer';

export class RegisterPage {
  readonly submitButton: Locator;
  readonly registerError: Locator;

  constructor(private readonly page: Page) {
    this.submitButton = page.getByTestId('register-submit');
    this.registerError = page.getByTestId('register-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  async register(customer: Customer): Promise<void> {
    const field = (testId: string) => this.page.getByTestId(testId);

    await field('first-name').fill(customer.firstName);
    await field('last-name').fill(customer.lastName);
    await field('dob').fill(customer.dob);

    // Once country, postal code and house number are valid, the form calls /postcode-lookup
    // (after a 300 ms debounce) and overwrites street, city and state with the result.
    // Wait for that call before typing the address, or our values can be silently replaced.
    const postcodeLookup = this.page.waitForResponse((r) => r.url().includes('/postcode-lookup'));
    await field('country').selectOption(customer.address.country);
    await field('postal_code').fill(customer.address.postalCode);
    await field('house_number').fill(customer.address.houseNumber);
    await postcodeLookup;

    await field('street').fill(customer.address.street);
    await field('city').fill(customer.address.city);
    await field('state').fill(customer.address.state);
    await field('phone').fill(customer.phone);
    await field('email').fill(customer.email);
    await field('password').fill(customer.password);
    await this.submitButton.click();
  }
}
