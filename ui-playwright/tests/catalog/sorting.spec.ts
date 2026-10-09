import { expect, test } from '../../src/fixtures';
import { SortOption } from '../../src/pages/catalog-filters.component';
import { byNumber, compareNames, isAscending, isDescending, toPrice } from '../../src/utils/ordering';

// Derived from Playwright Test Agents output (planner + generator), reviewed and reworked.
// See ai-agents/DECISIONS.md for what was kept, corrected and discarded.
test.describe('Catalog sorting', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('sort by name applies to the whole catalog, not just the visible page', async ({ homePage }) => {
    const { catalogFilters } = homePage;

    await catalogFilters.sortBy(SortOption.nameAsc);
    await expect(catalogFilters.sortSelect).toHaveValue(SortOption.nameAsc.value);
    await expect.poll(async () => isAscending(await homePage.names(), compareNames)).toBe(true);

    await catalogFilters.sortBy(SortOption.nameDesc);
    await expect.poll(async () => isDescending(await homePage.names(), compareNames)).toBe(true);
    const page1 = await homePage.names();

    await homePage.goToPage(2);
    await expect.poll(async () => (await homePage.names())[0]).not.toBe(page1[0]);
    const page2 = await homePage.names();
    expect(isDescending(page2, compareNames)).toBe(true);
    // The order continues across the page boundary.
    expect(compareNames(page1.at(-1)!, page2[0])).toBeGreaterThanOrEqual(0);
    await expect(catalogFilters.sortSelect).toHaveValue(SortOption.nameDesc.value);
  });

  test('sort by price orders from low to high across pages, and from high to low', async ({ homePage }) => {
    const { catalogFilters } = homePage;
    const prices = async () => (await homePage.productPrices.allTextContents()).map(toPrice);

    await catalogFilters.sortBy(SortOption.priceAsc);
    await expect.poll(async () => isAscending(await prices(), byNumber)).toBe(true);
    const page1 = await prices();
    const page1Names = await homePage.names();

    await homePage.goToPage(2);
    await expect.poll(async () => (await homePage.names())[0]).not.toBe(page1Names[0]);
    const page2 = await prices();
    expect(isAscending(page2, byNumber)).toBe(true);
    expect(page2[0]).toBeGreaterThanOrEqual(page1.at(-1)!);

    await catalogFilters.sortBy(SortOption.priceDesc);
    await expect.poll(async () => isDescending(await prices(), byNumber)).toBe(true);
  });
});
