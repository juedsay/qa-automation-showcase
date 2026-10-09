// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

const toNumber = (text: string) => Number(text.replace(/[^0-9.]/g, ''));
const isAscending = (list: number[]) => list.every((n, i) => i === 0 || list[i - 1] <= n);

test.describe('Catalog sorting and filtering', () => {
  test('Price range filter with the slider (mouse and keyboard)', async ({ homePage, page }) => {
    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
    const prices = homePage.productCards.getByTestId('product-price');
    const readPrices = async () => (await prices.allTextContents()).map(toNumber);
    const allWithin = async (min: number, max: number) =>
      (await readPrices()).every((p) => p >= min && p <= max);
    const valueOf = async (handle: typeof minHandle) =>
      Number(await handle.getAttribute('aria-valuenow'));

    // Press a key on a focused handle until it reaches the target value.
    const moveTo = async (handle: typeof minHandle, key: 'ArrowLeft' | 'ArrowRight', target: number) => {
      await handle.focus();
      let current = await valueOf(handle);
      while (current !== target) {
        await handle.press(key);
        const next = current + (key === 'ArrowLeft' ? -1 : 1);
        await expect(handle).toHaveAttribute('aria-valuenow', String(next));
        current = next;
      }
    };

    // 1. Open the home page and read aria-valuenow/aria-valuemin/aria-valuemax of the two sliders.
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(minHandle).toHaveAttribute('aria-valuemin', '0');
    await expect(minHandle).toHaveAttribute('aria-valuemax', '200');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '1');
    await expect(maxHandle).toHaveAttribute('aria-valuemin', '0');
    await expect(maxHandle).toHaveAttribute('aria-valuemax', '200');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '100');

    // 2. Focus the max handle and press ArrowLeft repeatedly until aria-valuenow is 15.
    await moveTo(maxHandle, 'ArrowLeft', 15);
    await expect(page.getByText('1 - 15', { exact: true })).toBeVisible();
    await expect.poll(() => allWithin(1, 15)).toBe(true);
    expect((await readPrices()).length).toBeGreaterThan(0);

    // 3. Focus the min handle and press ArrowRight to 5, combined with Price (Low - High) sort.
    await moveTo(minHandle, 'ArrowRight', 5);
    await expect(page.getByText('5 - 15', { exact: true })).toBeVisible();
    await expect.poll(() => allWithin(5, 15)).toBe(true);
    await page.getByTestId('sort').selectOption('Price (Low - High)');
    await expect(page.getByTestId('sort').locator('option:checked')).toHaveText('Price (Low - High)');
    await expect.poll(async () => isAscending(await readPrices())).toBe(true);
    expect(await allWithin(5, 15)).toBe(true);

    // 4. Click "Page-2" if pagination is displayed, then check prices.
    const page2 = page.getByRole('button', { name: 'Page-2' });
    if (await page2.isVisible()) {
      const firstPageNames = await homePage.productNames.allTextContents();
      await page2.click();
      await expect.poll(async () => (await homePage.productNames.allTextContents())[0]).not.toBe(firstPageNames[0]);
      expect(await allWithin(5, 15)).toBe(true);
    }

    // 5. Narrow the range: move the min handle up with ArrowRight until it meets the max handle.
    await minHandle.focus();
    for (let i = 0; i < 12; i++) {
      await minHandle.press('ArrowRight');
    }
    await expect(minHandle).toHaveAttribute('aria-valuenow', '15');
    // Handles cannot cross: one more press must not move the min handle past the max.
    await minHandle.press('ArrowRight');
    expect(await valueOf(minHandle)).toBeLessThanOrEqual(await valueOf(maxHandle));
    expect(await valueOf(maxHandle)).toBe(15);
    await expect(page.getByText('15 - 15', { exact: true })).toBeVisible();

    const noProducts = page.getByText('There are no products found.');
    await expect.poll(async () => (await noProducts.isVisible()) || (await homePage.productCards.count()) > 0).toBe(true);
    if (await noProducts.isVisible()) {
      await expect(homePage.productCards).toHaveCount(0);
    } else {
      expect(await allWithin(15, 15)).toBe(true);
    }
  });
});
