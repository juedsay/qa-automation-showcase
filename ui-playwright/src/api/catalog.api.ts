import { APIRequestContext, expect } from '@playwright/test';
import { env } from '../config/env';

interface ProductSummary {
  id: string;
  name: string;
  price: number;
}

/** `/products`: read-only catalog lookups. */
export class CatalogApi {
  constructor(private readonly request: APIRequestContext) {}

  /** Product ids change whenever the shared environment is reseeded, so resolve them by name. */
  async productByName(exactName: string): Promise<ProductSummary> {
    const response = await this.request.get(`${env.apiUrl}/products/search`, {
      headers: { Accept: 'application/json' },
      params: { q: exactName },
    });
    expect(response.status(), await response.text()).toBe(200);
    const { data } = (await response.json()) as { data: ProductSummary[] };
    const product = data.find((p) => p.name === exactName);
    if (!product) throw new Error(`Product not found in catalog: ${exactName}`);
    return product;
  }

  /** Every product name of a brand, across all result pages: the oracle for the brand filter. */
  async productNamesOfBrand(brandName: string): Promise<Set<string>> {
    const brandsResponse = await this.request.get(`${env.apiUrl}/brands`, { headers: { Accept: 'application/json' } });
    expect(brandsResponse.status(), await brandsResponse.text()).toBe(200);
    const brand = ((await brandsResponse.json()) as { id: string; name: string }[]).find((b) => b.name === brandName);
    if (!brand) throw new Error(`Brand not found: ${brandName}`);

    const names = new Set<string>();
    for (let page = 1, lastPage = 1; page <= lastPage; page++) {
      const response = await this.request.get(`${env.apiUrl}/products`, {
        headers: { Accept: 'application/json' },
        params: { by_brand: brand.id, page },
      });
      expect(response.status(), await response.text()).toBe(200);
      const body = (await response.json()) as { data: ProductSummary[]; last_page: number };
      body.data.forEach((product) => names.add(product.name));
      lastPage = body.last_page;
    }
    return names;
  }
}
