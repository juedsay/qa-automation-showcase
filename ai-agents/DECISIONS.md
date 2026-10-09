# Decisions on the agents' proposals

Flow: **catalog sorting and filtering** on Toolshop's home page, a flow I had not automated by
hand. The agents ran headless through Claude Code (`claude -p`) with only the browser MCP tools
and read access to the repo; the healer could additionally edit `tests/agent-generated/` and
nothing else. Nothing reached `tests/` without my review.

| Stage | Wall time | Cost (USD) | Notes |
|---|---|---|---|
| Planner | 45 min | 0.70 | 9 scenarios |
| Generator | ~7 min over 3 runs | 1.96 | first run cut by a usage limit; one case retried after a short Toolshop outage |
| Healer | 4 min | 0.75 | 4 failing tests in, 5 passing + 1 `fixme` out |
| **Total** | | **3.41** | |

Outcome legend: **Accepted** as proposed · **Corrected** (kept the idea, changed the
implementation) · **Discarded** (not kept, with the reason).

## Planner — [plan/catalog-sorting-filtering.md](plan/catalog-sorting-filtering.md)

| Agent proposal | Outcome | Why |
|---|---|---|
| Relational expectations (order, range membership, brand membership) instead of fixed values | Accepted | Exactly what a shared, periodically reseeded catalog needs. |
| Drive the price slider with the keyboard (`getByRole('slider')` + arrow keys) | Accepted | More stable than dragging, and also checks the slider is keyboard-accessible. |
| Read the brand list at runtime because other users leave junk brands behind | Corrected | The observation is real (20 brands, several like `5604820303776972editado`) and is field evidence for the day-2 defect: catalog create endpoints accept anonymous requests. But picking "whatever brand comes first" makes the test depend on that junk; I use a seeded brand by name instead. |
| 1.1 Sort by name, including the page-1 → page-2 boundary | Accepted | Checks the sort applies to the whole catalog, not only the visible page. |
| 1.2 Sort by price | Accepted, trimmed | Step 3 "record the behavior" is not an assertion. |
| 1.3 Price range with the slider | Accepted, corrected | "Slider range is 0–200 with defaults 1 and 100" hardcodes values that are not the feature under test. |
| 1.4 Brand filter | Accepted, corrected | Dropped step 5 (needs a brand with no products to exist: non-deterministic) and "open every product to check its brand" (slow). Replaced with an API oracle. |
| 1.5 Category filter + sort | Discarded | Category filtering is covered (day 1) and sorting by 1.1/1.2; the combination adds runtime, not confidence. |
| 1.6 Eco-friendly filter | Accepted | Clear oracle: every card shows the ECO badge. |
| 1.7 All filters combined | Discarded | Combinatorial; each constraint is covered on its own and failures would be hard to diagnose. |
| 1.8 Search + sort/filters | Discarded | Search (match and no-results) is already covered by day-1 tests. |
| 1.9 Reset with the "X" button and page reload | Accepted | Led to a real defect (see healer). |
| Steps phrased as "record the behavior" | Discarded | A test must assert an expected outcome; open questions belong in the plan. |

## Generator — [generated/](generated/) (untouched output)

First run of the 6 generated tests: **2 passed, 4 failed** ([healer/01-before-healer.txt](healer/01-before-healer.txt)).

| Agent proposal | Outcome | Why |
|---|---|---|
| Reused the project fixtures and page objects (`homePage`, `productCards`, `productNames`) | Accepted | It followed the seed, as intended. |
| Ordering checks with `expect.poll` over the visible list | Accepted | Correct way to wait for an asynchronous re-render. |
| `page.getByTestId('sort')`, slider and brand locators inlined in every test | Corrected | Duplicated in 6 files. Moved to a `CatalogFilters` component object composed into `HomePage`. |
| Selected option checked with `locator('option:checked')` (CSS) | Corrected | `toHaveValue('name,desc')` on the select says the same without CSS. |
| `isAscending` / `toNumber` helpers copied into each file | Corrected | Extracted to `src/utils/ordering.ts`. |
| Price test asserting slider bounds 0–200 and defaults 1/100 | Corrected | Data/config-dependent; the test now asserts what the filter does (every price in range). |
| Brand test waiting on `waitForResponse(GET /products)` | Corrected | Hung forever: the app now queries with the HTTP `QUERY` method. Waits are now on the visible list, not the network. |
| Brand test looping over every brand looking for an empty one | Discarded | Slow and depends on other users' junk data. |
| Eco test locating the "CO₂:" label with `getByText` | Discarded | The label is CSS-generated content, not DOM text; it is not part of the eco feature anyway. |
| Reset test hardcoding slider defaults `1`/`100` | Corrected | Reads the defaults before changing them and compares after the reset. |

## Healer — [healer/](healer/)

Changes: [healer/02-healer-changes.diff](healer/02-healer-changes.diff). Result as reported by the
healer and confirmed by my own run: **5 passed, 1 fixme** ([healer/03-after-healer.txt](healer/03-after-healer.txt)).

| Healer change | Outcome | Why |
|---|---|---|
| brand / eco: match the products response on path only, ignoring the method, because the app sends `QUERY /products` | Corrected | Diagnosis verified independently (captured `QUERY /products` in a browser). The fix works but still couples the test to a network detail that already changed once; the integrated tests wait on the UI instead. |
| eco: assert the `co2-rating-badge` element instead of the CSS-generated "CO₂:" text | Accepted | Correct root cause. |
| price range: stop expecting the max handle to stay at 15 when the min handle reaches it | Accepted | The slider pushes the max handle instead of letting handles cross: designed behavior, not a bug. The healer adapted the assertion and said so explicitly. |
| reset: found that after "X" the select still shows "Name (Z - A)" but the list returns to the default order; marked `test.fixme` instead of weakening the assertion | Corrected | Defect confirmed manually. `fixme` also skipped the unrelated reload checks, so I split it: the reset/reload behavior stays in `tests/catalog/filtering.spec.ts`, and the defect became an executable record with `test.fail()` in `tests/known-issues/reset-keeps-stale-sort.spec.ts`. |

## What I added on top of the agents

- **API oracle for the brand filter**: the UI must only show names the API lists for that brand
  (`CatalogApi.productNamesOfBrand`), instead of comparing the UI with itself.
- **A race in my own known-issue test**: right after the reset, the list still shows the old
  search results, which happen to be Z–A sorted, so my first version passed on stale data and hid
  the bug ("Expected to fail, but passed"). It now waits for the full catalog before checking.
- **Viewport pinned to 1280×720** in `playwright.config.ts`, so layout-dependent behavior is the
  same for local runs, CI and the agents.

## Takeaways

- The agents were fastest at **exploration**: in minutes they found the keyboard-operable slider,
  the `QUERY` method, the junk brands and the reset defect.
- They were weakest at **test design for a shared environment**: data-dependent constants,
  network coupling, duplicated locators, and "record the behavior" steps that assert nothing.
- The healer was honest where it mattered: it did not hide the reset defect behind a weaker
  assertion. Its fixes still needed review: one was correct, one was a reasonable workaround I
  replaced with a sturdier wait.
