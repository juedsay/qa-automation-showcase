import { expect, test } from '../../src/fixtures';

// Every test logs in with its own freshly registered customer. Toolshop locks an account
// after 3 failed logins, so failed attempts against the shared demo accounts would lock
// them for everyone using the public site (our own suite did exactly that once).
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('customer can log in with valid credentials', async ({ page, loginPage, header, newCustomer }) => {
    await loginPage.login(newCustomer.email, newCustomer.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
    await expect(header.userMenu).toHaveText(`${newCustomer.firstName} ${newCustomer.lastName}`);
  });

  test('wrong password shows a generic error', async ({ page, loginPage, newCustomer }) => {
    await loginPage.login(newCustomer.email, 'not-the-right-password');

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

  test('customer can log out', async ({ page, loginPage, header, newCustomer }) => {
    await loginPage.login(newCustomer.email, newCustomer.password);
    await expect(header.userMenu).toBeVisible();

    await header.signOut();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(header.signInLink).toBeVisible();
    await expect(header.userMenu).toBeHidden();
  });
});
