# fluxguard — Developer Guide

Read this before making any changes to the codebase.

---

## What This Project Is

**fluxguard** is a zero-dependency Node.js rate limiting library. It targets Node.js ≥ 18 and uses only built-in APIs. There are no production dependencies and there never should be.

---

## Commands

```bash
# Run all tests
node --test

# Run a single test file
node --test test/<filename>.test.js

# Lint
npx eslint .

# Lint with auto-fix
npx eslint . --fix
```

There is no build step. The library runs directly from source.

---

## Hard Constraints

- **Zero production dependencies.** `package.json` must have an empty `dependencies` field. Never add one without explicit sign-off.
- **Node.js ≥ 18 only.** Use `node:test`, `node:assert`, `node:fs`, `node:timers` — not third-party equivalents.
- **CommonJS only.** `require`/`module.exports`. No ESM unless explicitly asked.
- **Plain JavaScript.** No TypeScript.

---

## Code Style

- 2-space indentation, no tabs
- Single quotes for strings
- Semicolons required
- `'use strict';` at the top of every `.js` file
- No `console.log` in library code
- No `TODO`, `FIXME`, or chain-of-thought comments in committed code
- Comments explain **why**, not what

---

## What Requires Human Sign-Off Before Proceeding

Ask before doing any of the following:

- Adding any entry to `dependencies` in `package.json`
- Changing the public API in a breaking way
- Creating files or directories not obviously implied by the task
- Any `git push`, force push, or branch deletion

For everything else — editing files, running tests, writing new code — proceed autonomously.
