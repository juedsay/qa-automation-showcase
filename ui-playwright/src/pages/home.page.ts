import { Locator, Page } from '@playwright/test';
import { CatalogFilters } from './catalog-filters.component';

/** Product catalog: search, filters and the product grid. */
export class HomePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchCaption: Locator;
  readonly noResults: Locator;
  readonly filters: Locator;
  readonly catalogFilters: CatalogFilters;
  /** Product cards; their test IDs embed the product ULID (26 uppercase chars). */
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly ecoBadges: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    this.noResults = page.getByTestId('no-results');
    this.filters = page.getByTestId('filters');
    this.catalogFilters = new CatalogFilters(page);
    this.productCards = page.getByTestId(/^product-[0-9A-Z]{26}$/);
    this.productNames = this.productCards.getByTestId('product-name');
    this.productPrices = this.productCards.getByTestId('product-price');
    this.ecoBadges = this.productCards.getByTestId('eco-badge');
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

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: `Page-${pageNumber}`, exact: true }).click();
  }

  async names(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((name) => name.trim());
  }
}
