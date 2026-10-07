import { demoCustomer } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('customer can log in with valid credentials', async ({ page, loginPage, header }) => {
    await loginPage.login(demoCustomer.email, demoCustomer.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
    await expect(header.userMenu).toHaveText(demoCustomer.fullName);
  });

  test('wrong password shows a generic error', async ({ page, loginPage }) => {
    await loginPage.login(demoCustomer.email, 'not-the-right-password');

    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('unknown email shows the same generic error', async ({ loginPage }) => {
    // Same message as a wrong password, so the form does not reveal which accounts exist.
    await loginPage.login('nobody.here@example.com', 'whatever123');

    await expect(loginPage.loginError).toHaveText('Invalid email or password');
  });

  test('email with an invalid format is rejected before submitting', async ({ loginPage }) => {
    await loginPage.login('not-an-email', 'whatever123');

    await expect(loginPage.emailError).toHaveText('Email format is invalid');
    await expect(loginPage.loginError).toBeHidden();
  });

  test('empty form shows required-field errors', async ({ loginPage }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.emailError).toHaveText('Email is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
  });

  test('customer can log out', async ({ page, loginPage, header }) => {
    await loginPage.login(demoCustomer.email, demoCustomer.password);
    await expect(header.userMenu).toBeVisible();

    await header.signOut();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(header.signInLink).toBeVisible();
    await expect(header.userMenu).toBeHidden();
  });
});
