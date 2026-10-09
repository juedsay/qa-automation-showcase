# Healer run

The failures were real, not provoked: 4 of the 6 generated tests failed on their first run.

| File | Content |
|---|---|
| [01-before-healer.txt](01-before-healer.txt) | First run of the generated tests: 2 passed, 4 failed |
| [02-healer-changes.diff](02-healer-changes.diff) | Every change the healer made, against the untouched generator output in `../generated/` |
| [03-after-healer.txt](03-after-healer.txt) | Run after healing (my own run, not the agent's report): 5 passed, 1 skipped (`fixme`) |

The healer was allowed to edit `tests/agent-generated/` only. Its diagnoses were checked
independently before accepting them; see [../DECISIONS.md](../DECISIONS.md#healer--healer).
