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
}
