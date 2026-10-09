// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

const toNumber = (text: string) => Number(text.replace(/[^0-9.]/g, ''));
const isAscending = (list: number[]) => list.every((n, i) => i === 0 || list[i - 1] <= n);
const isDescending = (list: number[]) => list.every((n, i) => i === 0 || list[i - 1] >= n);

test.describe('Catalog sorting and filtering', () => {
  test('Sort by price low-high and high-low', async ({ homePage, page }) => {
    const sort = page.getByTestId('sort');
    const names = homePage.productNames;
    const prices = homePage.productCards.getByTestId('product-price');
    const readPrices = async () => (await prices.allTextContents()).map(toNumber);
    const readNames = async () => (await names.allTextContents()).map((n) => n.trim());

    // 1. Open the home page and select "Price (Low - High)" in the sort select.
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    await sort.selectOption('Price (Low - High)');
    await expect(sort.locator('option:checked')).toHaveText('Price (Low - High)');
    await expect.poll(async () => isAscending(await readPrices())).toBe(true);
    const lowHighPage1 = await readPrices();
    const lowHighPage1Names = await readNames();
    expect(lowHighPage1.length).toBeGreaterThan(1);

    // 2. Click "Page-2".
    await page.getByRole('button', { name: 'Page-2' }).click();
    await expect.poll(async () => (await readNames())[0]).not.toBe(lowHighPage1Names[0]);
    const lowHighPage2 = await readPrices();
    expect(isAscending(lowHighPage2)).toBe(true);
    expect(lowHighPage2[0]).toBeGreaterThanOrEqual(lowHighPage1.at(-1)!);
    await expect(sort.locator('option:checked')).toHaveText('Price (Low - High)');
    const page2Names = await readNames();

    // 3. Select "Price (High - Low)".
    await sort.selectOption('Price (High - Low)');
    await expect(sort.locator('option:checked')).toHaveText('Price (High - Low)');
    await expect.poll(async () => (await readNames())[0]).not.toBe(page2Names[0]);
    // Whether the page resets to 1 or stays on 2, the ordering must hold.
    await expect.poll(async () => isDescending(await readPrices())).toBe(true);
    const highLowFirst = (await readPrices())[0];

    // 4. Compare the first price of Low-High page 1 with the first price of High-Low page 1.
    await page.getByRole('button', { name: 'Page-1' }).click();
    await expect.poll(async () => isDescending(await readPrices())).toBe(true);
    const highLowPage1First = (await readPrices())[0];
    expect(highLowPage1First).toBeGreaterThanOrEqual(highLowFirst);
    expect(lowHighPage1[0]).toBeLessThanOrEqual(highLowPage1First);
  });
});
