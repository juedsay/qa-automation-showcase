# CLAUDE.md — qa-automation-showcase

Portfolio repo: UI tests (Playwright + TypeScript) and API tests (Java + RestAssured)
running in CI, plus a documented workflow with Playwright Test Agents.

## Language

- Everything committed to this repo (code, comments, README, commit messages) is in **English**.
- Conversation with the owner is in Spanish.

## Structure

```
ui-playwright/      # Playwright Test + TypeScript, Page Object Model, fixtures
api-restassured/    # Java 21, Gradle 9.7.1 (wrapper), RestAssured 6, JUnit 6, JSON Schema validation
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
- **Never send failed logins for a shared demo account.** Toolshop locks a non-admin account
  after 3 failed attempts (`UserService::MAX_LOGIN_ATTEMPTS`) and there is no self-service
  unlock; our own suite locked `customer@practicesoftwaretesting.com` this way on day 1.
  Every login test, positive or negative, uses its own freshly registered customer.
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
./gradlew test                                     # report: build/reports/tests/test/index.html
./gradlew test -Dtoolshop.apiUrl=http://localhost:8091   # run against a local Toolshop
```

## CI

- `.github/workflows/ci.yml`: gitleaks (full history), UI suite and API suite on every push/PR.
  Read-only token; third-party actions pinned by commit SHA (tag in a comment), applying the
  same 7-day cooldown as dependencies.
- The public site shows a Cloudflare bot check to GitHub-hosted runners, so the UI job runs against
  a disposable Toolshop started from the official images (`ci/toolshop/`, pinned by digest).
  Never try to get past the bot check. The API suite still runs against the public API.
- Reproduce the CI setup locally:

```bash
bash ci/toolshop/start.sh
TOOLSHOP_BASE_URL=http://localhost:4200 TOOLSHOP_API_URL=http://localhost:8091 pnpm --dir ui-playwright test
docker compose -p toolshop down -v
```

- A local backend is faster than the public one and exposes races the public site hides: always
  run new UI tests against both before pushing.

## UI test rules

- Locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, or `getByTestId`
  (Toolshop uses the `data-test` attribute, configured as `testIdAttribute`).
- No raw CSS/XPath selectors unless there is no accessible alternative; document why if used.
- No `waitForTimeout`. Rely on web-first assertions (`expect(locator).toBeVisible()`, etc.).
- After a sort/filter/search, poll the visible list (`expect.poll`) until it satisfies the
  condition. Do not wait on network requests: the catalog request already changed method once
  (`GET` -> `QUERY /products`). Beware stale lists that satisfy the condition by accident.
- The viewport is pinned to 1280x720 in `playwright.config.ts`; do not override it per test
  unless the test is about responsive layout.
- Page Objects expose actions and locators; assertions live in the specs.
- Shared setup goes in fixtures (e.g. `loggedInCustomer`), not in `beforeEach` copy-paste.
- API helpers in `src/api/` are one class per resource (`UsersApi`, `CatalogApi`, `CheckoutApi`).

## API test rules

- Every test creates the data it changes (e.g. registers its own user) and cleans up what the
  API allows it to delete. Read-only tests may use the seeded catalog (products, categories, brands).
- Layers: `client/` (one client per resource, sends requests and returns raw responses),
  `model/` (payload records), `data/` (factories), `support/` (arrange helpers, schemas), `tests/`.
  Clients never assert; tests do. Specs are injected into clients (anonymous or authenticated).
- Shared request spec: base URI, JSON in/out, snake_case mapping, logging only on failure,
  `Authorization` header masked in logs.
- Validate response bodies with JSON Schema (draft-04, the version RestAssured supports) under
  `src/test/resources/schemas/`. Write regexes with character classes (`[0-9]`), not backslashes.
- Look up product/category ids by name at runtime: they change whenever Toolshop reseeds.
- Invoice billing city/state must match `/postcode-lookup` for the country + postcode.
- No credentials in code: every test registers its own customer.
- Cross-layer tests (API setup → UI action → API verification) live in `ui-playwright/`
  and use Playwright's `request` fixture for the API steps.

## Playwright Test Agents

- Definitions live in `ui-playwright/.claude/agents/`, the MCP server in `ui-playwright/.mcp.json`
  (started with `node`, not `npx`). Regenerate with `pnpm exec playwright init-agents --loop=claude`
  after upgrading Playwright, then re-apply the `.mcp.json` change.
- Agent output is a proposal: raw output goes to `ai-agents/`, only reviewed code reaches `tests/`,
  and every decision is recorded in `ai-agents/DECISIONS.md`.
- Always pass agents the shared-site rules (no demo-account logins, no data creation, no fixed
  IDs or counts). The seed (`tests/seed.spec.ts`) states them too.

## Known issues

Defects found in Toolshop are kept as executable records that pass while the bug exists and
fail once it is fixed: `test.fail()` in `ui-playwright/tests/known-issues/`, and characterization
tests tagged `known-issue` in `api-restassured` (`KnownIssuesTest`). Never send requests that
create data on the shared site just to prove a defect.

## Dependencies

- Package manager: **pnpm** (never npm). Supply-chain settings live in
  `ui-playwright/pnpm-workspace.yaml` (7-day release cooldown, no unapproved install scripts,
  no git/tarball transitive deps). Do not relax them without asking.
- Pin exact versions (`pnpm add -D --save-exact`) and commit `pnpm-lock.yaml`.
- Review a new dependency (publisher, install scripts, transitive deps) before adding it.
- Java: versions live in `api-restassured/gradle/libs.versions.toml`; the wrapper pins the
  Gradle distribution SHA-256. Apply the same 7-day cooldown before adopting new releases.

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
