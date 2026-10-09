# Catalog Sorting and Filtering - Test Plan

## Application Overview

Test plan for sorting and filtering of the product catalog on the Toolshop home page (https://practicesoftwaretesting.com, Angular). Covers sort by name and price, price range slider, brand filter, category filter combined with sort, eco-friendly filter, and resetting filters/search. All flows are anonymous (no login, no data creation). The catalog is reseeded periodically and other users share the site, so assertions are relational (ordering, range membership, category/brand membership) and never rely on fixed product IDs, exact counts, or a specific product on page 1. Tests force locale en-US. Locators: getByTestId (data-test) for sort, search-query, search-reset, search-submit, product-name, product-price, eco-friendly-filter, sorting_completed; getByRole('checkbox', { name }) for category/brand; getByRole('slider', { name: 'ngx-slider' | 'ngx-slider-max' }) for the price handles. Select options are chosen by label (e.g. "Name (A - Z)"). Observed: the sort select option values are like "name,asc" / "price,asc"; the URL does not change when sorting or filtering; the brand list can contain extra junk brands created by other users, so tests must pick a brand by reading the list at runtime (or use ForgeFlex Tools / MightyCraft Hardware if present) rather than assuming the list. Every scenario starts from a freshly loaded home page with no filters.

## Test Scenarios

### 1. Catalog sorting and filtering

**Seed:** `tests/seed.spec.ts`

#### 1.1. Sort by name A-Z and Z-A

**File:** `tests/catalog/sort-by-name.spec.ts`

**Steps:**
  1. Open the home page and wait for product cards to render.
    - expect: Product cards are visible and the sort select has no option selected (default).
  2. Select "Name (A - Z)" in the sort select (getByTestId('sort')) and wait for results to refresh (web-first assertion on first card name changing or sorting_completed).
    - expect: The names from getByTestId('product-name') on page 1 are in ascending order (case-insensitive comparison, same as the app's ordering).
    - expect: The select shows "Name (A - Z)".
  3. Select "Name (Z - A)".
    - expect: The names on page 1 are in descending order.
    - expect: The first name differs from the first name in the A-Z result.
  4. With Z-A still selected, click "Page-2" in the pagination.
    - expect: Page 2 names are also descending.
    - expect: The last name of page 1 sorts at or after the first name of page 2 (the sort is applied across the whole catalog, not just within a page).
    - expect: The select still shows "Name (Z - A)".

#### 1.2. Sort by price low-high and high-low

**File:** `tests/catalog/sort-by-price.spec.ts`

**Steps:**
  1. Open the home page and select "Price (Low - High)" in the sort select.
    - expect: Prices from getByTestId('product-price'), parsed as numbers (strip '$'), are in non-decreasing order on page 1.
  2. Click "Page-2".
    - expect: Page 2 prices are non-decreasing.
    - expect: The first price of page 2 is greater than or equal to the last price of page 1.
    - expect: The sort select still shows "Price (Low - High)".
  3. Select "Price (High - Low)".
    - expect: Prices on the visible page are in non-increasing order.
    - expect: Results return to the first page or remain consistent (record the behavior; the ordering assertion must hold either way).
  4. Compare the first price of Low-High page 1 with the first price of High-Low page 1.
    - expect: The Low-High first price is less than or equal to the High-Low first price.

#### 1.3. Price range filter with the slider (mouse and keyboard)

**File:** `tests/catalog/price-range-filter.spec.ts`

**Steps:**
  1. Open the home page and read aria-valuenow/aria-valuemin/aria-valuemax of the two sliders ('ngx-slider' and 'ngx-slider-max').
    - expect: The slider range is 0-200 with default handles at 1 and 100.
  2. Focus the 'ngx-slider-max' handle and press ArrowLeft repeatedly until aria-valuenow is about 15.
    - expect: The handle is keyboard-operable; aria-valuenow decreases by 1 per key press.
    - expect: The price range label shows "1 - 15".
    - expect: After results refresh, every price on page 1 is between 1 and 15 inclusive.
  3. Focus the 'ngx-slider' (min) handle and press ArrowRight a few times (for example to 5).
    - expect: Every visible price is between the new min and max, inclusive.
    - expect: Combined with Price (Low - High) sort, the prices are within range and ascending.
  4. Click "Page-2" if pagination is displayed, then check prices.
    - expect: Every price on every visited page remains within the selected range.
  5. Narrow the range as far as possible (move the min handle up with ArrowRight until it meets the max handle).
    - expect: Handles cannot cross.
    - expect: Either products priced exactly at that value are shown or the "There are no products found." message appears; no error state or blank page.

#### 1.4. Brand filter

**File:** `tests/catalog/brand-filter.spec.ts`

**Steps:**
  1. Open the home page and read the checkbox labels inside the "Brands" group at runtime; choose the first brand (for example "ForgeFlex Tools").
    - expect: The Brands group lists at least one brand checkbox (the list may include extra brands created by other users).
  2. Check the chosen brand checkbox with getByRole('checkbox', { name }).
    - expect: The checkbox is checked and the product list refreshes.
    - expect: Opening each visible product (or reading product detail data) shows the brand equals the selected one; at minimum, the result set is a subset of the unfiltered set and is non-empty.
    - expect: Pagination, if shown, only spans the filtered results.
  3. Check a second brand as well.
    - expect: Results include products from either checked brand (union), and the count is not smaller than with a single brand.
  4. Uncheck both brands.
    - expect: The full unfiltered catalog returns (page 1 is populated and pagination is shown again).
  5. Select a brand that has no products (a junk brand with no products, if one exists in the list) and check it.
    - expect: "There are no products found." is shown and no product cards are displayed; the page does not error.

#### 1.5. Category filter combined with sort

**File:** `tests/catalog/category-filter-with-sort.spec.ts`

**Steps:**
  1. Open the home page, check the child category "Pliers" under "Hand Tools" (or any other child category read at runtime).
    - expect: The list refreshes and shows only products of that category (all names/prices non-empty); the result count is lower than the unfiltered catalog.
  2. Select "Name (A - Z)" in the sort select.
    - expect: The filtered products are in ascending name order.
    - expect: The Pliers checkbox is still checked.
  3. Switch the sort to "Price (High - Low)".
    - expect: The same set of products is displayed (same names as a set), now in non-increasing price order.
  4. Check a second category (e.g. "Hammer").
    - expect: Products from both categories are present; ordering by price still holds; the sort selection is preserved.
  5. Check the parent category "Hand Tools" checkbox, then uncheck it.
    - expect: Parent checkbox behavior is recorded (whether it selects/deselects its children); the displayed list always matches the checked boxes, and the sort is preserved.

#### 1.6. Eco-friendly filter

**File:** `tests/catalog/eco-filter.spec.ts`

**Steps:**
  1. Open the home page and note that products show a CO2 rating scale (A to E).
    - expect: The checkbox "Show only eco-friendly products" (getByTestId('eco-friendly-filter') or getByRole('checkbox')) is unchecked.
  2. Check the eco-friendly checkbox.
    - expect: The list refreshes; every visible product card shows an "ECO" badge.
    - expect: The product count is less than or equal to the unfiltered count.
  3. Select "Price (Low - High)" while the eco filter is on.
    - expect: Only ECO products are shown, in non-decreasing price order.
  4. Add a brand filter on top of the eco filter (a brand from the runtime list).
    - expect: Results are the intersection: ECO products of that brand, or the no-results message if none; no error occurs.
  5. Uncheck the eco-friendly checkbox.
    - expect: Non-ECO products are shown again; the brand filter and sort remain applied.

#### 1.7. Combining price range, brand, category and sort

**File:** `tests/catalog/combined-filters.spec.ts`

**Steps:**
  1. Open the home page, set the sort to "Price (Low - High)", and use the max slider handle (keyboard) to restrict the range to roughly 1 - 50.
    - expect: All visible prices are in range and ascending.
  2. Check one category (for example "Hand Tools" children such as "Hammer" or "Pliers").
    - expect: Results are restricted to that category, still within the price range and ascending.
  3. Check one brand read at runtime.
    - expect: Results are the intersection of all filters; every price is within range and ascending; or the no-results message is shown.
  4. Go to page 2 if available, then change the sort to "Name (A - Z)".
    - expect: The filters stay applied (price range, category, brand); names are in ascending order; the current page after sort change is recorded (it may reset to page 1).
  5. Uncheck the filters one at a time.
    - expect: Each removal widens the result set (never narrows it) and all remaining constraints stay satisfied.

#### 1.8. Search interacting with sort and filters

**File:** `tests/catalog/search-with-sort-filters.spec.ts`

**Steps:**
  1. Type "Pliers" in the Search textbox and click the "Search" button (getByTestId('search-submit')).
    - expect: A caption like "Searched for: Pliers" appears; every shown product name contains "Pliers" (case-insensitive).
  2. Select "Price (High - Low)".
    - expect: Search results remain limited to matches for the term and are ordered by non-increasing price.
  3. Search for a nonsense term such as "zzzxqq" and press Enter in the search box.
    - expect: "Searched for: zzzxqq" and "There are no products found." are shown; no product cards or pagination are displayed.
  4. Submit an empty search.
    - expect: The page does not error; the unfiltered catalog is shown (or the previous state; record the behavior).

#### 1.9. Reset filters and search

**File:** `tests/catalog/reset-filters.spec.ts`

**Steps:**
  1. Open the home page, select "Name (Z - A)", narrow the price slider (max to about 15), check a category, a brand and the eco-friendly filter, and run a search for "Pliers".
    - expect: The result list reflects all applied constraints (or shows the no-results message).
  2. Click the "X" button next to the search box (getByTestId('search-reset')).
    - expect: The search text is cleared and the search caption disappears.
    - expect: The category, brand and eco-friendly checkboxes are unchecked and the price slider returns to its default (1 - 100).
    - expect: The product list returns to the full catalog with pagination displayed.
    - expect: Record whether the sort selection is kept (observed during exploration: the sort remains selected after reset).
  3. Verify that the visible results still respect the sort value that remains selected.
    - expect: Products are ordered according to the select value shown (no mismatch between the displayed select value and actual order).
  4. Reload the page (F5).
    - expect: All filters, sort and search are cleared (state is not persisted in the URL) and the default catalog is shown.
