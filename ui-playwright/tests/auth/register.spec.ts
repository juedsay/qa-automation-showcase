import { buildCustomer } from '../../src/data/customer';
import { expect, test } from '../../src/fixtures';

test.describe('Registration', () => {
  test('new customer can register and then log in', async ({ page, registerPage, loginPage, header }) => {
    const customer = buildCustomer();

    await registerPage.goto();
    await registerPage.register(customer);

    await expect(page).toHaveURL(/\/auth\/login$/);
    await loginPage.login(customer.email, customer.password);
    await expect(header.userMenu).toHaveText(`${customer.firstName} ${customer.lastName}`);
  });

  test('email that is already registered is rejected', async ({ registerPage, newCustomer }) => {
    const duplicate = buildCustomer({ email: newCustomer.email });

    await registerPage.goto();
    await registerPage.register(duplicate);

    await expect(registerPage.registerError).toContainText('A customer with this email address already exists.');
  });
});
