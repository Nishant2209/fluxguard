# Contributing to fluxguard

Thank you for considering a contribution! This document explains how to get set up, what we expect, and how the review process works.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Commit Message Format](#commit-message-format)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Bugs](#reporting-bugs)
9. [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to abide by its terms.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- Git
- No other tools required — the library has zero production dependencies

### Setup

```bash
git clone https://github.com/<your-org>/fluxguard.git
cd fluxguard
node --version   # must be >= 18
node --test      # all tests should pass on a clean checkout
```

There is no install step because there are no dependencies.

---

## Development Workflow

1. Fork the repository and create your branch from `main`.
2. Name branches descriptively: `feat/sliding-window-cost`, `fix/token-bucket-refill-edge`.
3. Make your changes, keeping commits small and focused.
4. Run the full test suite before opening a PR: `node --test`
5. Run the linter: `npx eslint .`
6. Open a pull request against `main`.

**Never commit directly to `main`.** All changes go through pull requests.

---

## Coding Standards

### Zero Dependencies Policy

fluxguard has a strict zero-production-dependencies policy. Do not add anything to the `dependencies` field in `package.json`. Dev dependencies are acceptable but should be proposed in an issue first.

### Style

- 2-space indentation, no tabs
- Single quotes for strings
- Semicolons required
- `'use strict';` at the top of every `.js` file
- No `console.log` in library code
- No `TODO`, `FIXME`, or chain-of-thought comments in committed code
- Comments explain **why**, not what

### Public API Stability

Do not add, remove, or rename public exports without opening an issue first. Breaking changes require a major version bump and a migration guide.

---

## Testing Requirements

- Every bug fix must include a regression test that fails before the fix and passes after.
- Every new feature must have tests. What to cover is your call — but tests that pass trivially with a no-op implementation are not acceptable.
- Use Node.js's built-in `node:test` and `node:assert`. Do not introduce Jest, Mocha, or any other test framework.
- All existing tests must continue to pass.

```bash
node --test
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

**Types:** `feat`, `fix`, `test`, `docs`, `refactor`, `perf`, `chore`

- Summary line ≤ 72 characters
- Use the imperative mood: "add support" not "added support"
- Reference issues in the footer: `Closes #42`

---

## Pull Request Process

1. Tests pass: `node --test`
2. Linter passes: `npx eslint .`
3. New behaviour is covered by tests
4. No new production dependencies added
5. A maintainer will review within a few business days
6. PRs are merged with **squash-and-merge** to keep `main` history clean

---

## Reporting Bugs

Open an issue with:

- Node.js version (`node --version`)
- Minimal reproduction case
- Expected vs. actual behavior
- Relevant error output or stack trace

---

## Suggesting Features

Open an issue before writing any code. Describe the problem you are solving and why existing options don't address it. Features that add production dependencies or change the public API require maintainer consensus first.

---

## License

By contributing to fluxguard, you agree your contributions will be licensed under the [MIT License](./LICENSE).
