---
name: add-api-endpoint
description: Use when adding, changing, or removing an HTTP endpoint or resource in this Express course API (routes/, db/store.js, server.js), e.g. "add DELETE /users/:id", "add a posts resource", "add a PATCH route". Covers the store helper, route handler, validation and error format, tests, and docs/api.md. Not for general questions, refactors outside routes, or config changes.
---

# Add or change an API endpoint

Follow these steps in order. They encode this project's conventions (see CLAUDE.md).

1. **Store helper** — put any data access in `db/store.js` and export it. Routes never hold state. If you add new state, make `seed()`/`reset()` restore it so tests start clean.
2. **Route handler** — one file per resource in `routes/<resource>.js` exporting an Express router. Validate input in the handler:
   - bad or missing input → `400`
   - record not found → `404`
   - create → `201`
   - every error body is JSON `{ "error": "message" }`, nothing else
3. **Mount** — a new resource router gets mounted in `server.js` under its base path (`app.use('/things', thingsRouter)`). Existing routers need no change.
4. **Tests** — add to `tests/<resource>.test.js` (node:test + supertest). Use `test.beforeEach(() => store.reset())`. Cover the happy path plus each `400` and `404` branch you added.
5. **Docs** — update `docs/api.md` with the endpoint, its body, and every status code it can return.
6. **Verify** — run `npm test` and `npm run lint`; both must pass before you report done.

Match the style of `routes/users.js`: short handler comments in the form `// METHOD /path — what it does.`, `return res...` on every exit, `Number(req.params.id)` for ids.
