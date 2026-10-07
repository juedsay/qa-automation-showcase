import { test as base } from '@playwright/test';
import { CatalogApi } from '../api/catalog.api';
import { CheckoutApi } from '../api/checkout.api';
import { UsersApi } from '../api/users.api';
import { buildCustomer, Customer } from '../data/customer';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { Header } from '../pages/header.component';
import { HomePage } from '../pages/home.page';
import { InvoicesPage } from '../pages/invoices.page';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { RegisterPage } from '../pages/register.page';

/** A customer whose JWT is also available to the test, for API calls on their behalf. */
export type CustomerSession = Customer & { token: string };

interface Fixtures {
  usersApi: UsersApi;
  catalogApi: CatalogApi;
  checkoutApi: CheckoutApi;
  header: Header;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  invoicesPage: InvoicesPage;
  /** A brand-new customer registered through the API, isolated from other test runs. */
  newCustomer: Customer;
  /** Authenticates `page` as `newCustomer` without going through the login form. */
  loggedInCustomer: CustomerSession;
}

export const test = base.extend<Fixtures>({
  usersApi: async ({ request }, use) => {
    await use(new UsersApi(request));
  },
  catalogApi: async ({ request }, use) => {
    await use(new CatalogApi(request));
  },
  checkoutApi: async ({ request }, use) => {
    await use(new CheckoutApi(request));
  },
  header: async ({ page }, use) => {
    await use(new Header(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  },

  newCustomer: async ({ usersApi }, use) => {
    const customer = buildCustomer();
    await usersApi.register(customer);
    await use(customer);
    // The public API exposes no self-service account deletion, so the user is left behind.
    // Emails are unique per run, so leftovers never collide with later runs.
  },

  loggedInCustomer: async ({ page, usersApi, newCustomer }, use) => {
    const token = await usersApi.login(newCustomer.email, newCustomer.password);
    // The Angular app reads the JWT from localStorage on startup (TokenStorageService).
    // Set it once on the app's origin (not via addInitScript, which would re-inject it on
    // every navigation and undo a logout); the test's first navigation picks it up.
    await page.goto('/');
    await page.evaluate((value) => window.localStorage.setItem('auth-token', value), token);
    await use({ ...newCustomer, token });
  },
});

export { expect } from '@playwright/test';
