import { buildCustomer } from '../../src/data/customer';
import { expect, test } from '../../src/fixtures';

// Known defect, kept as an executable record. `test.fail()` means the test is EXPECTED to fail:
// it passes while the bug exists and turns red the day Toolshop fixes it, which is the signal
// to remove the annotation.
test.describe('Known issues', () => {
  test('a customer with a password longer than 40 characters can log in through the UI', async ({
    page,
    usersApi,
    loginPage,
  }) => {
    test.fail(true, 'Registration accepts any password length, but the login form caps it at 40 characters.');
    test.info().annotations.push({
      type: 'issue',
      description:
        'register.component.ts has no max length validator; login.component.ts uses Validators.maxLength(40).',
    });

    const customer = buildCustomer({ password: `Qa!${'x'.repeat(40)}Aa1` }); // 45 characters
    await usersApi.register(customer);
    // The account itself is valid: the API accepts these credentials.
    await usersApi.login(customer.email, customer.password);

    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);

    await expect(page).toHaveURL(/\/account$/, { timeout: 5_000 });
  });
});
