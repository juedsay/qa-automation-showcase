// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

test.describe('Catalog sorting and filtering', () => {
  test('Reset filters and search', async ({ homePage, page }) => {
    const sort = page.getByTestId('sort');
    const selectedSort = sort.locator('option:checked');
    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
    const searchBox = page.getByRole('textbox', { name: 'Search' });
    const caption = page.getByTestId('search-caption');
    const resetButton = page.getByTestId('search-reset');
    const category = page.getByRole('checkbox', { name: 'Pliers', exact: true });
    const brand = page.getByRole('group', { name: 'Brands' }).getByRole('checkbox').first();
    const eco = page.getByRole('checkbox', { name: 'Show only eco-friendly products' });
    const pagination = page.getByRole('navigation').getByRole('button', { name: 'Page-1' });

    // 1. Open the home page, select "Name (Z - A)", narrow the price slider, check a category,
    //    a brand and the eco-friendly filter, and run a search for "Pliers".
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();

    await sort.selectOption('Name (Z - A)');
    await expect(selectedSort).toHaveText('Name (Z - A)');

    await maxHandle.focus();
    for (let value = 99; value >= 15; value--) {
      await maxHandle.press('ArrowLeft');
      await expect(maxHandle).toHaveAttribute('aria-valuenow', String(value));
    }

    await category.check();
    await brand.check();
    await eco.check();
    await searchBox.fill('Pliers');
    await searchBox.press('Enter');
    await expect(caption).toContainText('Pliers');

    // The list reflects the constraints or shows the no-results message.
    const noProducts = page.getByText('There are no products found.');
    await expect
      .poll(async () => (await noProducts.isVisible()) || (await homePage.productCards.count()) > 0)
      .toBe(true);

    // 2. Click the "X" button next to the search box.
    await resetButton.click();
    await expect(searchBox).toHaveValue('');
    await expect(caption).toBeHidden();
    await expect(category).not.toBeChecked();
    await expect(brand).not.toBeChecked();
    await expect(eco).not.toBeChecked();
    await expect(minHandle).toHaveAttribute('aria-valuenow', '1');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '100');
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(pagination).toBeVisible();

    // The sort selection is kept after the reset (observed behavior).
    await expect(selectedSort).toHaveText('Name (Z - A)');

    // 3. Verify that the visible results still respect the sort value that remains selected.
    const names = await homePage.productNames.allTextContents();
    expect(names.length).toBeGreaterThan(0);
    const collator = new Intl.Collator('en', { sensitivity: 'base' });
    const descending = names.every((n, i) => i === 0 || collator.compare(names[i - 1], n) >= 0);
    expect(descending).toBe(true);

    // 4. Reload the page (F5).
    await page.reload();
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(selectedSort).not.toHaveText('Name (Z - A)');
    await expect(searchBox).toHaveValue('');
    await expect(caption).toBeHidden();
    await expect(category).not.toBeChecked();
    await expect(brand).not.toBeChecked();
    await expect(eco).not.toBeChecked();
    await expect(minHandle).toHaveAttribute('aria-valuenow', '1');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '100');
    await expect(pagination).toBeVisible();
  });
});
