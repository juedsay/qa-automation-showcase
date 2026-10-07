/**
 * Target environment. Defaults point to the public Toolshop (sprint 5) deployment;
 * override with env vars to run against a local Docker instance.
 */
export const env = {
  baseUrl: process.env.TOOLSHOP_BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiUrl: process.env.TOOLSHOP_API_URL ?? 'https://api.practicesoftwaretesting.com',
} as const;

/**
 * Seeded demo account published in the Toolshop README. It is shared with everyone
 * using the public site, so it is only used for read-only checks such as logging in.
 */
export const demoCustomer = {
  email: process.env.TOOLSHOP_DEMO_EMAIL ?? 'customer@practicesoftwaretesting.com',
  password: process.env.TOOLSHOP_DEMO_PASSWORD ?? 'welcome01',
  fullName: 'Jane Doe',
} as const;
