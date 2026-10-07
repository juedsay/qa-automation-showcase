import { expect, test } from '../../src/fixtures';

test.describe('Catalog', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('search returns only matching products', async ({ homePage }) => {
    await homePage.search('pliers');

    await expect(homePage.searchCaption).toContainText('pliers');
    await expect(homePage.productNames).not.toHaveCount(0);
    // Retrying assertion: the grid is re-rendered asynchronously, so a one-shot read
    // (allTextContents) can still see the previous, unfiltered products.
    await expect(homePage.productNames.filter({ hasNotText: /pliers/i })).toHaveCount(0);
  });

  test('search without matches shows an empty state', async ({ homePage }) => {
    await homePage.search('zzz-no-such-tool');

    await expect(homePage.noResults).toHaveText('There are no products found.');
    await expect(homePage.productCards).toHaveCount(0);
  });

  test('category filter narrows the product list', async ({ homePage }) => {
    await homePage.filterByCategory('Hammer');

    await expect(homePage.productNames).not.toHaveCount(0);
    // Every product in the seeded "Hammer" category has "hammer" in its name.
    await expect(homePage.productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
  });

  test('product detail shows name, price and description', async ({ page, homePage, productPage }) => {
    await homePage.openProduct('Combination Pliers');

    await expect(page).toHaveURL(/\/product\/[0-9A-Z]{26}$/);
    await expect(productPage.name).toHaveText('Combination Pliers');
    await expect(productPage.unitPrice).toHaveText(/^\d+\.\d{2}$/);
    await expect(productPage.description).not.toBeEmpty();
    await expect(productPage.addToCartButton).toBeEnabled();
  });
});
