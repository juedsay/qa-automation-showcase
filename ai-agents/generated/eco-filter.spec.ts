// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

const toNumber = (text: string) => Number(text.replace(/[^0-9.]/g, ''));
const isAscending = (list: number[]) => list.every((n, i) => i === 0 || list[i - 1] <= n);

test.describe('Catalog sorting and filtering', () => {
  test('Eco-friendly filter', async ({ homePage, page }) => {
    const eco = page.getByTestId('eco-friendly-filter');
    const sort = page.getByTestId('sort');
    const brands = page.getByRole('group', { name: 'Brands' });
    const ecoBadges = homePage.productCards.getByTestId('eco-badge');
    const prices = homePage.productCards.getByTestId('product-price');
    const readPrices = async () => (await prices.allTextContents()).map(toNumber);
    const productsResponse = () =>
      page.waitForResponse(
        (r) => r.url().includes('/products') && r.request().method() === 'GET' && r.ok(),
      );
    // Runs an action and returns the total reported by the products request it triggers.
    const totalAfter = async (action: () => Promise<void>) => {
      const response = productsResponse();
      await action();
      const body = await (await response).json();
      return { total: Number(body.total ?? 0), count: (body.data ?? []).length };
    };

    // 1. Open the home page and note that products show a CO2 rating scale (A to E).
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(homePage.productCards.first().getByText('CO₂:')).toBeVisible();
    await expect(eco).not.toBeChecked();
    const unfilteredCount = await homePage.productCards.count();

    // 2. Check the eco-friendly checkbox.
    const ecoOn = await totalAfter(() => eco.check());
    await expect(eco).toBeChecked();
    await expect(homePage.productCards).toHaveCount(ecoOn.count);
    expect(ecoOn.count).toBeGreaterThan(0);
    expect(ecoOn.count).toBeLessThanOrEqual(unfilteredCount);
    await expect(ecoBadges).toHaveCount(ecoOn.count);

    // 3. Select "Price (Low - High)" while the eco filter is on.
    const sorted = await totalAfter(() => sort.selectOption('Price (Low - High)').then(() => undefined));
    await expect(sort.locator('option:checked')).toHaveText('Price (Low - High)');
    await expect(homePage.productCards).toHaveCount(sorted.count);
    await expect(ecoBadges).toHaveCount(sorted.count);
    await expect.poll(async () => isAscending(await readPrices())).toBe(true);

    // 4. Add a brand filter on top of the eco filter (a brand from the runtime list).
    const brandBoxes = brands.getByRole('checkbox');
    await expect(brandBoxes.first()).toBeVisible();
    const brandLabels = (
      await brandBoxes.evaluateAll((els) => els.map((el) => el.parentElement?.textContent?.trim() ?? ''))
    ).filter(Boolean);
    expect(brandLabels.length).toBeGreaterThanOrEqual(1);
    const brand = brandLabels[0];
    const brandBox = brands.getByRole('checkbox', { name: brand, exact: true });
    const withBrand = await totalAfter(() => brandBox.check());
    await expect(brandBox).toBeChecked();
    if (withBrand.count === 0) {
      await expect(homePage.noResults).toHaveText('There are no products found.');
      await expect(homePage.productCards).toHaveCount(0);
    } else {
      await expect(homePage.productCards).toHaveCount(withBrand.count);
      await expect(ecoBadges).toHaveCount(withBrand.count);
      await expect.poll(async () => isAscending(await readPrices())).toBe(true);
    }
    expect(withBrand.total).toBeLessThanOrEqual(ecoOn.total);

    // 5. Uncheck the eco-friendly checkbox.
    const ecoOff = await totalAfter(() => eco.uncheck());
    await expect(eco).not.toBeChecked();
    await expect(brandBox).toBeChecked();
    await expect(sort.locator('option:checked')).toHaveText('Price (Low - High)');
    // Dropping the eco filter can only widen the brand results.
    expect(ecoOff.total).toBeGreaterThanOrEqual(withBrand.total);
    if (ecoOff.count > 0) {
      await expect(homePage.productCards).toHaveCount(ecoOff.count);
      await expect.poll(async () => isAscending(await readPrices())).toBe(true);
    }
  });
});
