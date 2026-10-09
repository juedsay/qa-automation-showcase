/** Parses a price label such as "$14.15" into a number. */
export const toPrice = (text: string): number => Number(text.replace(/[^0-9.]/g, ''));

/** Case-insensitive comparison, matching how the catalog sorts names. */
export const compareNames = (a: string, b: string): number =>
  a.trim().localeCompare(b.trim(), 'en', { sensitivity: 'base' });

export const isAscending = <T>(items: T[], compare: (a: T, b: T) => number): boolean =>
  items.every((item, i) => i === 0 || compare(items[i - 1], item) <= 0);

export const isDescending = <T>(items: T[], compare: (a: T, b: T) => number): boolean =>
  items.every((item, i) => i === 0 || compare(items[i - 1], item) >= 0);

export const byNumber = (a: number, b: number): number => a - b;
