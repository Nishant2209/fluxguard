# fluxguard — Developer Guide for Claude Code

This file is the authoritative reference for working on this codebase. Read it in full before making any changes. Deviating from the conventions here will result in your work being rejected in review.

---

## Project Overview

**fluxguard** is a zero-dependency Node.js rate limiting library. It implements four algorithms — Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window Log — behind a unified API. It also ships HTTP middleware adapters for the built-in `http` module (and Express-compatible frameworks).

**Hard constraints:**
- Zero production dependencies. `package.json` must have an empty `dependencies` field.
- Node.js ≥ 18 only. Use built-in `node:test`, `node:assert`, `node:fs`, `node:timers` — never third-party equivalents.
- CommonJS (`require`/`module.exports`). No ESM (`import`/`export`) unless explicitly asked.
- No TypeScript. Plain `.js` files only.

---

## Repository Layout

```
fluxguard/
├── index.js              # Public entry point — re-exports everything
├── src/
│   ├── algorithms/
│   │   ├── token-bucket.js
│   │   ├── leaky-bucket.js
│   │   ├── fixed-window.js
│   │   └── sliding-window-log.js
│   ├── middleware/
│   │   └── http.js       # Vanilla http + Express adapter
│   ├── persistence/
│   │   └── file-store.js # Optional file-based state persistence
│   └── utils/
│       └── clock.js      # Mockable time abstraction — ALWAYS use this, never Date.now() directly
├── test/
│   ├── token-bucket.test.js
│   ├── leaky-bucket.test.js
│   ├── fixed-window.test.js
│   ├── sliding-window-log.test.js
│   ├── middleware.test.js
│   └── persistence.test.js
├── CLAUDE.md
├── CONTRIBUTING.md
├── package.json
└── index.js
```

When adding a new algorithm or module, follow this layout exactly. Do not create files outside these directories without asking first.

---

## Commands

```bash
# Run all tests
node --test

# Run a single test file
node --test test/token-bucket.test.js

# Run tests in watch mode
node --test --watch

# Lint
npx eslint .

# Lint and auto-fix
npx eslint . --fix
```

There is no build step. The library runs directly from source.

---

## Core API Contract

Every algorithm class must implement this interface exactly:

```js
class SomeAlgorithm {
  /**
   * @param {object} options
   */
  constructor(options) {}

  /**
   * Attempt to consume `cost` tokens/slots for the given key.
   *
   * @param {string} key    - Caller identity (e.g. IP address, user ID)
   * @param {number} [cost] - How many tokens to consume (default: 1)
   * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
   *   - allowed:    true if the request is permitted
   *   - remaining:  tokens/slots remaining after this call
   *   - retryAfter: milliseconds until at least `cost` tokens are available
   *                 (0 when allowed === true)
   */
  consume(key, cost = 1) {}

  /**
   * Reset state for a specific key (or all keys if omitted).
   * @param {string} [key]
   */
  reset(key) {}

  /**
   * Return a plain-object snapshot of current state for serialization.
   * Must be the inverse of fromSnapshot().
   * @returns {object}
   */
  toSnapshot() {}

  /**
   * Restore state from a snapshot produced by toSnapshot().
   * @param {object} snapshot
   */
  fromSnapshot(snapshot) {}
}
```

Do not add methods to the public API that are not in this contract without discussing it first. Internal helper methods must be prefixed with `_`.

---

## The Clock Abstraction

**Never call `Date.now()` directly in algorithm or middleware code.** Always use `src/utils/clock.js`:

```js
const { Clock } = require('../utils/clock');
const clock = new Clock();
const now = clock.now(); // returns milliseconds since epoch
```

This allows tests to inject a fake clock and control time without monkey-patching globals. Any algorithm that calls `Date.now()` directly will fail code review.

---

## Testing Conventions

- Use Node.js's built-in `node:test` and `node:assert` — no Jest, Mocha, or any other test runner.
- Test files live in `test/` and are named `<module>.test.js`.
- Every test must control time via a fake clock — never use real `setTimeout` or `Date.now()` in tests.
- Tests must cover: happy path, rate limit hit, cost > 1, reset behaviour, key isolation (two different keys don't interfere), and snapshot round-trip.
- A test that passes trivially with a no-op implementation is a bad test. Each assertion must be falsifiable by breaking the corresponding code path.

Example test structure:
```js
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { TokenBucket } = require('../src/algorithms/token-bucket');

describe('TokenBucket', () => {
  it('allows requests within capacity', () => { ... });
  it('rejects requests when bucket is empty', () => { ... });
  it('refills tokens over time', () => { ... });
  it('isolates state between different keys', () => { ... });
  it('round-trips through toSnapshot/fromSnapshot', () => { ... });
});
```

---

## Code Style

- 2-space indentation. No tabs.
- Single quotes for strings.
- Semicolons required.
- `'use strict';` at the top of every `.js` file.
- JSDoc on every exported class and public method (see the API contract above for format).
- Comments explain **why**, not what. Do not write `// increment counter` or `// return result`.
- No `console.log` in library code. Use no-op by default; a `debug` option may be passed to constructors.
- No `TODO`, `FIXME`, or `HACK` comments in committed code. If something is incomplete, do not commit it.

---

## Persistence (file-store)

`src/persistence/file-store.js` provides optional durable state. Rules:

- Uses `node:fs` synchronous APIs for simplicity (`readFileSync` / `writeFileSync`).
- Stores snapshots as newline-delimited JSON (one entry per key, one line per flush).
- The algorithm constructors accept an optional `store` option: `new TokenBucket({ ..., store: fileStore })`.
- Persistence is opt-in. Algorithms must function correctly with no store attached.
- On load, if the snapshot file is corrupted or missing, the algorithm must start fresh with a warning — never throw on startup.

---

## Middleware (http adapter)

`src/middleware/http.js` exports a factory:

```js
const { createMiddleware } = require('./src/middleware/http');

const middleware = createMiddleware(limiter, {
  keyExtractor: (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  onRejected: (req, res, result) => {
    res.writeHead(429, { 'Retry-After': Math.ceil(result.retryAfter / 1000) });
    res.end('Too Many Requests');
  },
});
```

- The middleware must work with both vanilla `http.createServer` and Express (Express calls middleware with `(req, res, next)`).
- `keyExtractor` defaults to `req.socket.remoteAddress` if not provided.
- `onRejected` has a sensible default (429 + `Retry-After` header).
- The middleware must not buffer the request body or interfere with streaming.

---

## What Requires Human Sign-Off Before Proceeding

Ask before doing any of the following:

- Adding any entry to `dependencies` in `package.json`
- Changing the public API contract (method signatures, return shapes)
- Adding a new algorithm not listed in the layout above
- Creating files outside the directory structure documented above
- Changing the persistence file format (breaking change for existing users)
- Any `git push`, force push, or branch deletion

For everything else — editing files, running tests, fixing bugs, writing new tests — proceed autonomously.

---

## Common Mistakes to Avoid

- **Calling `Date.now()` directly** — always use the clock abstraction.
- **Mutating the options object** passed to constructors — clone it or read-only.
- **Sharing state between keys** — each key must be fully isolated.
- **Integer overflow in timestamp arithmetic** — use `Number.MAX_SAFE_INTEGER` checks where appropriate.
- **Not resetting the clock in teardown** — fake clock state must not leak between tests.
- **Returning `retryAfter: 0` when `allowed === false`** — `retryAfter` must always be > 0 when the request is rejected.
