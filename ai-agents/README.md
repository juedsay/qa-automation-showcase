# Working with Playwright Test Agents

This folder documents how I used the **Playwright Test Agents** (planner, generator, healer)
that ship with Playwright 1.56+ on a flow I had **not** automated by hand: catalog sorting and
filtering in Toolshop. The point is not that an AI wrote tests, but which of its proposals I
kept, which I corrected and which I threw away, and why. See [DECISIONS.md](DECISIONS.md).

## Setup (Playwright 1.63.0, Claude Code)

```bash
cd ui-playwright
pnpm exec playwright init-agents --loop=claude
```

It generates:

| File | Purpose |
|---|---|
| `.claude/agents/playwright-test-planner.md` | explores the app, writes a Markdown plan to `specs/` |
| `.claude/agents/playwright-test-generator.md` | turns plan items into test files |
| `.claude/agents/playwright-test-healer.md` | runs failing tests and repairs them (can edit files) |
| `.mcp.json` | registers the `playwright-test` MCP server the agents drive the browser with |
| `tests/seed.spec.ts` | test the agents run first; also the template for generated tests |

Changes I made to the generated setup, and why:

- **`.mcp.json`**: the default starts the server with `cmd /c npx playwright run-test-mcp-server`
  on Windows. This repo does not use npm, and `npx`/`pnpm` are `.cmd` shims on Windows that need
  a shell. I call the CLI with Node directly (`node node_modules/@playwright/test/cli.js
  run-test-mcp-server`), which works the same on Windows, macOS and Linux. Verified with an MCP
  `initialize` + `tools/list` handshake (server "Playwright Test Runner" 1.63.0, 89 tools).
- **`tests/seed.spec.ts`**: replaced the empty default with one that uses the project's fixtures
  and page objects, and states the rules for exploring a shared site (never log in with the
  public demo accounts, which lock after 3 failed attempts; never create catalog data).

Agents run on the `sonnet` model as defined by Playwright. The Claude Code session must be
opened in `ui-playwright/` so it picks up `.claude/agents/` and `.mcp.json`, and the
`playwright-test` MCP server has to be approved on first use.

## Folder layout

```
ai-agents/
├── README.md       # this file
├── plan/           # planner output (copy of ui-playwright/specs/*.md)
├── generated/      # generator output, untouched
├── healer/         # failing run, healer changes (diff) and result
└── DECISIONS.md    # agent proposal | what I did | why
```
