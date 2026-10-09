// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

test.describe('Catalog sorting and filtering', () => {
  test('Brand filter', async ({ homePage, page }) => {
    const brands = page.getByRole('group', { name: 'Brands' });
    const productsResponse = () =>
      page.waitForResponse(
        (r) => r.url().includes('/products') && r.request().method() === 'GET' && r.ok(),
      );
    const toggle = async (name: string, checked: boolean) => {
      const response = productsResponse();
      const box = brands.getByRole('checkbox', { name, exact: true });
      if (checked) await box.check();
      else await box.uncheck();
      await response;
    };
    const pageButtons = page.getByRole('button', { name: /^Page-[0-9]+$/ });

    // 1. Open the home page and read the checkbox labels inside the "Brands" group at runtime
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    const checkboxes = brands.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible();
    const labels = (await checkboxes.evaluateAll((els) =>
      els.map((el) => el.parentElement?.textContent?.trim() ?? ''),
    )).filter(Boolean);
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const [first, second] = labels;
    const unfilteredNames = await homePage.productNames.allInnerTexts();
    await expect(pageButtons.nth(1)).toBeVisible();

    // 2. Check the chosen brand checkbox with getByRole('checkbox', { name })
    await toggle(first, true);
    await expect(brands.getByRole('checkbox', { name: first, exact: true })).toBeChecked();
    await expect(homePage.productCards.first()).toBeVisible();
    const firstCount = await homePage.productCards.count();
    expect(firstCount).toBeGreaterThan(0);
    expect(firstCount).toBeLessThanOrEqual(unfilteredNames.length);

    // 3. Check a second brand as well
    if (second) {
      await toggle(second, true);
      await expect(brands.getByRole('checkbox', { name: second, exact: true })).toBeChecked();
      await expect(homePage.productCards.first()).toBeVisible();
      expect(await homePage.productCards.count()).toBeGreaterThanOrEqual(firstCount);

      // 4. Uncheck both brands
      await toggle(second, false);
    }
    await toggle(first, false);
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(pageButtons.nth(1)).toBeVisible();

    // 5. Select a brand that has no products (a junk brand, if one exists in the list)
    let emptyBrandFound = false;
    for (const name of labels) {
      const response = productsResponse();
      await brands.getByRole('checkbox', { name, exact: true }).check();
      const body = await (await response).json();
      if ((body.data ?? []).length === 0) {
        emptyBrandFound = true;
        await expect(homePage.noResults).toHaveText('There are no products found.');
        await expect(homePage.productCards).toHaveCount(0);
        break;
      }
      await toggle(name, false);
    }
    if (!emptyBrandFound) {
      test.info().annotations.push({
        type: 'note',
        description: 'No brand without products exists right now; step 5 not applicable.',
      });
    }
  });
});
