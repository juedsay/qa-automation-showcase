import { expect, test } from '../../src/fixtures';
import { SortOption } from '../../src/pages/catalog-filters.component';
import { byNumber, isAscending, toPrice } from '../../src/utils/ordering';

// Derived from Playwright Test Agents output (planner + generator + healer), reviewed and reworked.
// See ai-agents/DECISIONS.md for what was kept, corrected and discarded.
//
// Waiting strategy: every filter change re-renders the grid asynchronously, so assertions poll
// the visible list until it satisfies the filter. They never wait on the network request, whose
// HTTP method already changed once (GET -> QUERY) and broke the agent's first version.
test.describe('Catalog filtering', () => {
  const SEEDED_BRAND = 'ForgeFlex Tools';

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('price range slider keeps every product within the selected range', async ({ homePage }) => {
    const { catalogFilters } = homePage;
    const prices = async () => (await homePage.productPrices.allTextContents()).map(toPrice);
    const allWithin = async (min: number, max: number) => {
      const visible = await prices();
      return visible.length > 0 && visible.every((p) => p >= min && p <= max);
    };

    await catalogFilters.setPrice('max', 15);
    await expect(catalogFilters.maxPrice).toHaveAttribute('aria-valuenow', '15');
    await expect.poll(() => allWithin(0, 15)).toBe(true);

    await catalogFilters.setPrice('min', 5);
    await expect(catalogFilters.minPrice).toHaveAttribute('aria-valuenow', '5');
    await expect.poll(() => allWithin(5, 15)).toBe(true);

    // The range and a sort combine.
    await catalogFilters.sortBy(SortOption.priceAsc);
    await expect.poll(async () => isAscending(await prices(), byNumber)).toBe(true);
    expect(await allWithin(5, 15)).toBe(true);
  });

  test('brand filter shows only products of that brand', async ({ homePage, catalogApi }) => {
    const { catalogFilters } = homePage;
    // Oracle from the API, so the UI is checked against data rather than against itself.
    const brandProducts = await catalogApi.productNamesOfBrand(SEEDED_BRAND);

    await catalogFilters.brand(SEEDED_BRAND).check();

    await expect(catalogFilters.brand(SEEDED_BRAND)).toBeChecked();
    await expect
      .poll(async () => {
        const names = await homePage.names();
        return names.length > 0 && names.every((name) => brandProducts.has(name));
      })
      .toBe(true);
  });

  test('eco-friendly filter shows only eco products and combines with sorting', async ({ homePage }) => {
    const { catalogFilters } = homePage;
    const prices = async () => (await homePage.productPrices.allTextContents()).map(toPrice);
    const onlyEcoShown = async () => {
      const cards = await homePage.productCards.count();
      return cards > 0 && (await homePage.ecoBadges.count()) === cards;
    };

    await expect(catalogFilters.ecoFriendly).not.toBeChecked();
    await catalogFilters.ecoFriendly.check();
    await expect.poll(onlyEcoShown).toBe(true);

    await catalogFilters.sortBy(SortOption.priceAsc);
    await expect.poll(async () => (await onlyEcoShown()) && isAscending(await prices(), byNumber)).toBe(true);

    // Removing the filter brings non-eco products back; the sort stays applied.
    await catalogFilters.ecoFriendly.uncheck();
    await expect.poll(onlyEcoShown).toBe(false);
    await expect(catalogFilters.sortSelect).toHaveValue(SortOption.priceAsc.value);
  });

  test('reset button clears search and filters, and a reload clears everything', async ({ page, homePage }) => {
    const { catalogFilters } = homePage;
    const defaultMin = await catalogFilters.minPrice.getAttribute('aria-valuenow');
    const defaultMax = await catalogFilters.maxPrice.getAttribute('aria-valuenow');

    await catalogFilters.sortBy(SortOption.nameDesc);
    await catalogFilters.setPrice('max', 30);
    await catalogFilters.brand(SEEDED_BRAND).check();
    await catalogFilters.ecoFriendly.check();
    await homePage.search('Pliers');
    await expect(homePage.searchCaption).toContainText('Pliers');

    await catalogFilters.resetButton.click();

    await expect(homePage.searchInput).toHaveValue('');
    await expect(homePage.searchCaption).toBeHidden();
    await expect(catalogFilters.brand(SEEDED_BRAND)).not.toBeChecked();
    await expect(catalogFilters.ecoFriendly).not.toBeChecked();
    await expect(catalogFilters.minPrice).toHaveAttribute('aria-valuenow', defaultMin!);
    await expect(catalogFilters.maxPrice).toHaveAttribute('aria-valuenow', defaultMax!);
    await expect(homePage.productCards.first()).toBeVisible();
    // The sort selection survives the reset; whether it is still applied is a known issue
    // (tests/known-issues/reset-keeps-stale-sort.spec.ts).

    // State is not kept in the URL, so a reload starts from scratch, sort included.
    await page.reload();
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(catalogFilters.sortSelect).toHaveValue('');
    await expect(homePage.searchInput).toHaveValue('');
  });
});
