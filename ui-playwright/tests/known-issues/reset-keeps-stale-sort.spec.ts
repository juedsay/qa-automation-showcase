import { expect, test } from '../../src/fixtures';
import { SortOption } from '../../src/pages/catalog-filters.component';
import { compareNames, isDescending } from '../../src/utils/ordering';

// Known defect found by the Playwright healer agent and confirmed manually (see ai-agents/).
// `test.fail()` means the test is EXPECTED to fail: it passes while the bug exists and turns
// red the day Toolshop fixes it, which is the signal to remove the annotation.
test.describe('Known issues', () => {
  test('after resetting search and filters, the list still follows the selected sort', async ({ homePage }) => {
    test.fail(true, 'The reset keeps "Name (Z - A)" selected but reloads the list in the default order.');

    const { catalogFilters } = homePage;
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    await catalogFilters.sortBy(SortOption.nameDesc);
    await homePage.search('Pliers');
    await expect(homePage.searchCaption).toContainText('Pliers');
    await expect.poll(async () => isDescending(await homePage.names(), compareNames)).toBe(true);
    const searchResults = new Set(await homePage.names());

    await catalogFilters.resetButton.click();
    await expect(homePage.searchCaption).toBeHidden();
    // Wait until the full catalog replaces the (already Z-A sorted) search results; asserting the
    // order before that would pass on stale data and hide the defect. The search for "Pliers" also
    // matches products by description (e.g. "Bolt Cutters"), so wait for a name it did NOT return.
    await expect.poll(async () => (await homePage.names()).some((name) => !searchResults.has(name))).toBe(true);

    await expect(catalogFilters.sortSelect).toHaveValue(SortOption.nameDesc.value);
    expect(isDescending(await homePage.names(), compareNames)).toBe(true);
  });
});
