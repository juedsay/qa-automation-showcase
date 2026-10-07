/**
 * Target environment. Defaults point to the public Toolshop (sprint 5) deployment;
 * override with env vars to run against a local Docker instance.
 */
export const env = {
  baseUrl: process.env.TOOLSHOP_BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiUrl: process.env.TOOLSHOP_API_URL ?? 'https://api.practicesoftwaretesting.com',
} as const;
