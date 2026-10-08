---
description: Review a change against this project's conventions checklist
argument-hint: [git ref or path, defaults to changes vs main]
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep
---

Review this change against the project conventions in CLAUDE.md.

Scope: `git diff $ARGUMENTS` — if no argument was given, use `git diff main` plus any untracked files from `git status --short`.

Check each item and report PASS, FAIL, or N/A:

1. One route file per resource, mounted in `server.js`
2. No state held in routes; all data access goes through `db/store.js`
3. Input validated in the route, `400` on bad input, `404` on a missing record
4. Every error response is JSON shaped `{ "error": "message" }`
5. Tests added or updated, including the `400`/`404` branches
6. `docs/api.md` updated for any endpoint change

Output a table with columns: Check | Result | Evidence. Give `file:line` evidence for every FAIL, then one line on what to fix first. Do not edit any files.
