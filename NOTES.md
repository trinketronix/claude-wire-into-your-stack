# Notes — wiring Claude into the course API

## Server (MCP)
I connected the official **filesystem** server at project scope, pinned to `@2026.8.31` and pointed only at `./docs`. It needs no credentials, so nothing secret is in `.mcp.json`. It's useful here because `docs/api.md` is the contract for the API, and this gives Claude a sandboxed way to read it and check it against the routes. The permission rule in `.claude/settings.json` allows only the three read-only tools, `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. The write tools (`write_file`, `edit_file`, `move_file`) are not allowed, so they still prompt. I used it on a real task: comparing `docs/api.md` with `routes/*.js` (see the headless run below).

## Skill
`add-api-endpoint` captures the workflow this repo repeats every time an endpoint changes: store helper in `db/store.js`, route with `400`/`404` and `{ "error": ... }` bodies, mount in `server.js`, tests with `store.reset()`, update `docs/api.md`, then run tests and lint. The description names the trigger (adding, changing or removing an HTTP endpoint or resource in this Express API, with example phrasings) and says what it is not for. I confirmed it fires: asking "Add a DELETE /users/:id endpoint" without naming the skill made Claude call `add-api-endpoint`.

## Command
`/check-conventions [ref]` reviews a diff (default: changes against `main`) against the six CLAUDE.md conventions and prints a PASS/FAIL table with `file:line` evidence. It is worth a shortcut because it is the same review before every commit, and `$ARGUMENTS` lets me aim it at any ref. It is limited to read-only tools. I ran it on a deliberately bad change (module-level state, a plain-text `500`, no tests or docs) and it flagged all four violations, then I reverted the change.

## Hook
A **PostToolUse** hook (it *reacts*, it does not prevent) on the `Edit|Write` matcher. It runs `.claude/hooks/eslint-fix.js`, which applies `eslint --fix` to edited files under `server.js`, `routes/`, `db/` and `tests/` and returns exit code 2 with the lint output if errors remain, so Claude sees them and fixes them. I chose a Node script over `jq` so it works on a fresh checkout. I triggered it by having Claude append an undefined variable to `routes/health.js`: the hook fired and reported the `no-undef` error back to Claude.

## Headless run
```
claude -p "Using the docs MCP server to read docs/api.md, compare it with routes/*.js and server.js. List every endpoint that is undocumented, documented but missing, or whose status codes differ. Read-only: do not edit anything." \
  --allowedTools "Read,Grep,Glob,mcp__docs__read_text_file"
```
It is a docs-drift audit. It found no mismatches, only minor gaps (no explicit `200` documented, and `""` handling differs between `POST` and `PUT`). I locked it down to read-only tools: no `Edit`, `Write` or `Bash`, and only one MCP tool, so an unattended run can read the repo but cannot change it or run commands.
