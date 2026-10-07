# CLAUDE.md — qa-automation-showcase

Portfolio repo: UI tests (Playwright + TypeScript) and API tests (Java + RestAssured)
running in CI, plus a documented workflow with Playwright Test Agents.

## Language

- Everything committed to this repo (code, comments, README, commit messages) is in **English**.
- Conversation with the owner is in Spanish.

## Structure

```
ui-playwright/      # Playwright Test + TypeScript, Page Object Model, fixtures
api-restassured/    # Java 21, Gradle (wrapper), RestAssured, JUnit 5, JSON Schema validation
ai-agents/          # planner / generator / healer output + DECISIONS.md
.github/workflows/  # CI for both suites + Playwright report on GitHub Pages
```

## System under test

Both suites target **Practice Software Testing — Toolshop** (sprint 5, the bug-free version),
a public demo e-commerce app built for testing practice by Testsmith.

- UI: https://practicesoftwaretesting.com (Angular)
- API: https://api.practicesoftwaretesting.com (Laravel REST, Swagger at `/api/documentation`)
- Source and default accounts: https://github.com/testsmith-io/practice-software-testing
- Default demo accounts (public, from the project README): `admin@practicesoftwaretesting.com`,
  `customer@practicesoftwaretesting.com`, `customer2@...`, `customer3@...`.
- It is a **shared** environment: other people use the same accounts and data at the same time.
  Tests that change state (cart, profile, orders) use a freshly registered user with a unique
  email, not the shared demo accounts.
- The UI follows the browser language. Tests force `locale: 'en-US'` so text is stable.
- Product IDs are generated values (ULIDs); locate products by name, never by hardcoded ID.
- The project license allows use for reference/practice only; do not redistribute or host it.

If the service is down or has changed, stop and report it. Never silently replace it with a mock.
Fallback (only with the owner's OK): run Toolshop locally with its official Docker Compose setup.

## Commands

```bash
# UI (pnpm only — npm is not used in this repo)
cd ui-playwright
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test                 # run the suite
pnpm typecheck            # tsc --noEmit
pnpm report               # open the last HTML report

# API (requires JDK 21)
cd api-restassured
./gradlew test
```

## UI test rules

- Locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, or `getByTestId`
  (Toolshop uses the `data-test` attribute, configured as `testIdAttribute`).
- No raw CSS/XPath selectors unless there is no accessible alternative; document why if used.
- No `waitForTimeout`. Rely on web-first assertions (`expect(locator).toBeVisible()`, etc.).
- Page Objects expose actions and locators; assertions live in the specs.
- Shared setup goes in fixtures (e.g. a logged-in page fixture), not in `beforeEach` copy-paste.

## API test rules

- Every test creates the data it changes (e.g. registers its own user) and cleans up what the
  API allows it to delete. Read-only tests may use the seeded catalog (products, categories, brands).
- Shared request spec: base URI, JSON content type, logging only on failure.
- Validate response bodies with JSON Schema files under `src/test/resources/schemas/`.
- Demo credentials are read from config, not hardcoded in tests.
- Cross-layer tests (API setup → UI action → API verification) live in `ui-playwright/`
  and use Playwright's `request` fixture for the API steps.

## Dependencies

- Package manager: **pnpm** (never npm). Supply-chain settings live in
  `ui-playwright/pnpm-workspace.yaml` (7-day release cooldown, no unapproved install scripts,
  no git/tarball transitive deps). Do not relax them without asking.
- Pin exact versions (`pnpm add -D --save-exact`) and commit `pnpm-lock.yaml`.
- Review a new dependency (publisher, install scripts, transitive deps) before adding it.

## Test data and secrets

- Only public demo credentials are used. No real secrets, no `.env` files committed.
- `.gitignore` must exclude `node_modules/`, `test-results/`, `playwright-report/`,
  `build/`, `.gradle/`, `.env*`.

## Working agreement

- Work one day of the plan at a time; wait for the owner's OK before moving on.
- Nothing is "done" until it has been run and the real output shown.
- If a test fails, find the root cause before changing the test.
- Small commits, Conventional Commits (`feat:`, `test:`, `ci:`, `docs:`, `chore:`).
- No `git push`, remote repo creation or GitHub Pages changes without asking first.
- Stay in scope: no extra features, frameworks or unrequested refactors.
- If something can't be verified (e.g. a recent Playwright Test Agents change), say so instead of guessing.
