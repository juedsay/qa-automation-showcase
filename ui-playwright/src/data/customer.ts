import { randomUUID } from 'node:crypto';

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  country: string; // ISO 3166-1 alpha-2 code, as expected by the API
  postalCode: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string; // YYYY-MM-DD
  phone: string;
  address: Address;
}

/**
 * Builds a unique customer for tests that change state (cart, profile, orders),
 * so they never collide with other people using the shared demo accounts.
 */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  const id = randomUUID().slice(0, 8);
  return {
    firstName: 'Quinn',
    lastName: `Tester${id}`,
    email: `qa.showcase.${id}@example.com`,
    // Unique per run because the API rejects passwords found in breach lists.
    // Kept under 40 chars: the login form caps passwords at 40 while registration has no
    // maximum, so a longer password can be registered but never used to log in via the UI.
    password: `Qa!${randomUUID().slice(0, 12)}Aa1`,
    dob: '1990-05-15',
    phone: '5551234567',
    address: {
      street: 'Main Street',
      houseNumber: '42',
      city: 'Springfield',
      state: 'Illinois',
      country: 'US',
      postalCode: '62701',
    },
    ...overrides,
  };
}
