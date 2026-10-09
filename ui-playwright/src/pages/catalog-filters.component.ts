import { Locator, Page } from '@playwright/test';

/** Sort options of the catalog: visible label and the `<option>` value the app uses. */
export const SortOption = {
  nameAsc: { label: 'Name (A - Z)', value: 'name,asc' },
  nameDesc: { label: 'Name (Z - A)', value: 'name,desc' },
  priceAsc: { label: 'Price (Low - High)', value: 'price,asc' },
  priceDesc: { label: 'Price (High - Low)', value: 'price,desc' },
} as const;
export type SortOption = (typeof SortOption)[keyof typeof SortOption];

/**
 * Sorting and filtering sidebar of the catalog: sort select, price range slider,
 * brand and eco-friendly filters, and the reset button next to the search box.
 */
export class CatalogFilters {
  readonly sortSelect: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly brands: Locator;
  readonly ecoFriendly: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.sortSelect = page.getByTestId('sort');
    // ngx-slider handles; the min handle's name is a prefix of the max handle's, hence `exact`.
    this.minPrice = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    this.maxPrice = page.getByRole('slider', { name: 'ngx-slider-max' });
    this.brands = page.getByRole('group', { name: 'Brands' });
    this.ecoFriendly = page.getByTestId('eco-friendly-filter');
    this.resetButton = page.getByTestId('search-reset');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option.label });
  }

  brand(name: string): Locator {
    return this.brands.getByRole('checkbox', { name, exact: true });
  }

  /**
   * Moves a price handle with the keyboard, one unit per key press. The app applies the
   * filter when the handle is released (`userChangeEnd`), so callers should assert on the
   * product list afterwards rather than on the slider.
   */
  async setPrice(handle: 'min' | 'max', target: number): Promise<void> {
    const slider = handle === 'min' ? this.minPrice : this.maxPrice;
    const current = Number(await slider.getAttribute('aria-valuenow'));
    const key = target < current ? 'ArrowLeft' : 'ArrowRight';
    await slider.focus();
    for (let i = 0; i < Math.abs(target - current); i++) {
      await slider.press(key);
    }
  }
}
