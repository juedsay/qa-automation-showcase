import { Locator, Page } from '@playwright/test';

/** Product catalog: search, filters and the product grid. */
export class HomePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchCaption: Locator;
  readonly noResults: Locator;
  readonly filters: Locator;
  /** Product cards; their test IDs embed the product ULID (26 uppercase chars). */
  readonly productCards: Locator;
  readonly productNames: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    this.noResults = page.getByTestId('no-results');
    this.filters = page.getByTestId('filters');
    this.productCards = page.getByTestId(/^product-[0-9A-Z]{26}$/);
    this.productNames = this.productCards.getByTestId('product-name');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async filterByCategory(name: string): Promise<void> {
    await this.filters.getByRole('checkbox', { name, exact: true }).check();
  }

  /**
   * Searches for the product first, so it is found regardless of catalog order or pagination,
   * then opens the card whose title matches the name exactly.
   */
  async openProduct(name: string): Promise<void> {
    await this.search(name);
    await this.productCards.getByRole('heading', { name, exact: true }).click();
  }
}
