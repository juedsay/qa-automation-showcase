import { APIRequestContext, expect } from '@playwright/test';
import { env } from '../config/env';
import { Address } from '../data/customer';

export interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  invoicelines?: { quantity: number; unit_price: number; product: { name: string } }[];
}

const JSON_HEADERS = { Accept: 'application/json' };
const bearer = (token: string) => ({ ...JSON_HEADERS, Authorization: `Bearer ${token}` });

/** `/carts`, `/postcode-lookup` and `/invoices`: everything needed to place an order via the API. */
export class CheckoutApi {
  constructor(private readonly request: APIRequestContext) {}

  async createCart(): Promise<string> {
    const response = await this.request.post(`${env.apiUrl}/carts`, { headers: JSON_HEADERS });
    expect(response.status(), await response.text()).toBe(201);
    return ((await response.json()) as { id: string }).id;
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<void> {
    const response = await this.request.post(`${env.apiUrl}/carts/${cartId}`, {
      headers: JSON_HEADERS,
      data: { product_id: productId, quantity },
    });
    expect(response.status(), await response.text()).toBe(200);
  }

  /**
   * The invoice endpoint rejects a billing city/state that does not match the postcode
   * lookup, so a valid billing address has to come from the lookup itself.
   */
  async billingAddress(country: string, postalCode: string, houseNumber: string): Promise<Address> {
    const response = await this.request.get(`${env.apiUrl}/postcode-lookup`, {
      headers: JSON_HEADERS,
      params: { country, postcode: postalCode, house_number: houseNumber },
    });
    expect(response.status(), await response.text()).toBe(200);
    const body = (await response.json()) as { street: string; city: string; state: string };
    return { street: body.street, houseNumber, city: body.city, state: body.state, country, postalCode };
  }

  async createInvoice(token: string, cartId: string, billing: Address): Promise<Invoice> {
    const response = await this.request.post(`${env.apiUrl}/invoices`, {
      headers: bearer(token),
      data: {
        billing_street: billing.street,
        billing_house_number: billing.houseNumber,
        billing_city: billing.city,
        billing_state: billing.state,
        billing_country: billing.country,
        billing_postal_code: billing.postalCode,
        payment_method: 'cash-on-delivery',
        payment_details: {},
        cart_id: cartId,
      },
    });
    expect(response.status(), await response.text()).toBe(201);
    return (await response.json()) as Invoice;
  }

  async invoiceByNumber(token: string, invoiceNumber: string): Promise<Invoice> {
    const list = await this.request.get(`${env.apiUrl}/invoices`, { headers: bearer(token) });
    expect(list.status(), await list.text()).toBe(200);
    const { data } = (await list.json()) as { data: Invoice[] };
    const summary = data.find((invoice) => invoice.invoice_number === invoiceNumber);
    if (!summary) throw new Error(`Invoice ${invoiceNumber} not found for this customer`);

    const detail = await this.request.get(`${env.apiUrl}/invoices/${summary.id}`, { headers: bearer(token) });
    expect(detail.status(), await detail.text()).toBe(200);
    return (await detail.json()) as Invoice;
  }
}
