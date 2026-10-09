import { expect, test } from '../src/fixtures';

// Seed for the Playwright Test Agents (planner / generator / healer).
// The agents run this test to set up the environment and use it as the template for
// every generated test, so it must use the project's fixtures and page objects.
//
// Rules for agents exploring the shared Toolshop site:
// - Never log in with the public demo accounts (customer@..., admin@...): 3 failed logins lock
//   them for everyone. When a flow needs a signed-in user, use the `loggedInCustomer` fixture.
// - Do not create catalog data (brands, categories, products) or send contact messages.
test.describe('Seed', () => {
  test('seed', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
  });
});
