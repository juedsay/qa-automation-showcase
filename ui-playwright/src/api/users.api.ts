import { APIRequestContext, expect } from '@playwright/test';
import { env } from '../config/env';
import { Customer } from '../data/customer';

/** `/users`: registration and login, used to set up test state without the UI. */
export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(customer: Customer): Promise<void> {
    const response = await this.request.post(`${env.apiUrl}/users/register`, {
      headers: { Accept: 'application/json' },
      data: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        password: customer.password,
        dob: customer.dob,
        phone: customer.phone,
        address: {
          street: customer.address.street,
          house_number: customer.address.houseNumber,
          city: customer.address.city,
          state: customer.address.state,
          country: customer.address.country,
          postal_code: customer.address.postalCode,
        },
      },
    });
    expect(response.status(), await response.text()).toBe(201);
  }

  /** Returns a JWT. Tokens expire after 5 minutes, so log in per test rather than sharing one. */
  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${env.apiUrl}/users/login`, {
      headers: { Accept: 'application/json' },
      data: { email, password },
    });
    expect(response.status(), await response.text()).toBe(200);
    const body = (await response.json()) as { access_token: string };
    return body.access_token;
  }
}
