import { Locator, Page } from '@playwright/test';

/** Top navigation bar, shared by every page. */
export class Header {
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
