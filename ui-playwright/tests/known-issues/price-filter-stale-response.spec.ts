import { expect, test } from '../../src/fixtures';
import { toPrice } from '../../src/utils/ordering';

// Known defect found while running the suite in CI against a local Toolshop: every release of a
// price-slider handle sends a product request (`QUERY /products`), and the app renders whichever
// response arrives LAST, even when it belongs to an older range. Under network latency the list
// can show products outside the range the slider displays.
//
// The test makes the race deterministic by delaying the first response so it arrives after the
// second one. `test.fail()` means it is EXPECTED to fail while the bug exists.
test.describe('Known issues', () => {
  test('the product list matches the latest price range even if an older response arrives late', async ({
    page,
    homePage,
  }) => {
    test.fail(true, 'Stale product responses are not discarded: the last response to arrive wins.');

    const { catalogFilters } = homePage;
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();

    // Deliver the response to the OLDER request only after the newer one has been received,
    // so the out-of-order arrival is guaranteed rather than left to timing.
    let productQueries = 0;
    let newerReceived!: () => void;
    const newerResponse = new Promise<void>((resolve) => (newerReceived = resolve));
    page.on('response', (response) => {
      if (response.request().method() === 'QUERY' && response.url().includes('/products')) newerReceived();
    });
    let staleResponseDelivered!: () => void;
    const staleDelivered = new Promise<void>((resolve) => (staleResponseDelivered = resolve));
    await page.route('**/products**', async (route) => {
      if (route.request().method() !== 'QUERY') return route.fallback();
      productQueries += 1;
      if (productQueries === 1) {
        const response = await route.fetch();
        await newerResponse;
        await route.fulfill({ response });
        staleResponseDelivered();
        return;
      }
      await route.fallback();
    });

    // First release: min 1 -> 2 (delayed response). Second release: min 2 -> 50.
    await catalogFilters.setPrice('min', 2);
    await catalogFilters.setPrice('min', 50);
    await expect(catalogFilters.minPrice).toHaveAttribute('aria-valuenow', '50');

    // Let the late response arrive and Angular render it (two animation frames) before checking
    // what the user sees; asserting earlier would pass on the correct, not-yet-replaced list.
    await staleDelivered;
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

    const prices = (await homePage.productPrices.allTextContents()).map(toPrice);
    expect(prices.length).toBeGreaterThan(0);
    expect(prices.every((price) => price >= 50)).toBe(true);
  });
});
