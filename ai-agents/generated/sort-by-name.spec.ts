// spec: specs/catalog-sorting-filtering.md
// seed: tests/seed.spec.ts

import { expect, test } from '../../src/fixtures';

const normalize = (name: string) => name.trim().toLowerCase();

test.describe('Catalog sorting and filtering', () => {
  test('Sort by name A-Z and Z-A', async ({ homePage, page }) => {
    const sort = page.getByTestId('sort');
    const names = homePage.productNames;
    const readNames = async () => (await names.allTextContents()).map(normalize);
    const isAscending = (list: string[]) => list.every((n, i) => i === 0 || list[i - 1] <= n);
    const isDescending = (list: string[]) => list.every((n, i) => i === 0 || list[i - 1] >= n);

    // 1. Open the home page and wait for product cards to render.
    await homePage.goto();
    await expect(homePage.productCards.first()).toBeVisible();
    await expect(sort).toHaveValue('');

    // 2. Select "Name (A - Z)" in the sort select and wait for results to refresh.
    await sort.selectOption('Name (A - Z)');
    await expect.poll(async () => isAscending(await readNames())).toBe(true);
    await expect(sort.locator('option:checked')).toHaveText('Name (A - Z)');
    const firstAscName = (await names.first().textContent())?.trim() ?? '';
    expect(firstAscName).not.toBe('');

    // 3. Select "Name (Z - A)".
    await sort.selectOption('Name (Z - A)');
    await expect(names.first()).not.toHaveText(firstAscName);
    await expect.poll(async () => isDescending(await readNames())).toBe(true);
    await expect(sort.locator('option:checked')).toHaveText('Name (Z - A)');
    const page1Names = await readNames();
    const page1First = (await names.first().textContent())?.trim() ?? '';

    // 4. With Z-A still selected, click "Page-2" in the pagination.
    await page.getByRole('button', { name: 'Page-2' }).click();
    await expect(names.first()).not.toHaveText(page1First);
    await expect.poll(async () => isDescending(await readNames())).toBe(true);
    const page2Names = await readNames();
    expect(page1Names.at(-1)! >= page2Names[0]).toBe(true);
    await expect(sort.locator('option:checked')).toHaveText('Name (Z - A)');
  });
});
