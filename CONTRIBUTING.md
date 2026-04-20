# Contributing to fluxguard

Thank you for considering a contribution to fluxguard! This document explains how to get set up, what we expect from contributions, and how the review process works.

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

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to abide by its terms. Report unacceptable behavior to the maintainers.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0 (uses the built-in `node:test` runner)
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

1. **Fork** the repository and create your branch from `main`.
2. Name branches descriptively: `feat/sliding-window-cost`, `fix/token-bucket-refill-edge`, `test/leaky-bucket-reset`.
3. Make your changes, keeping commits small and focused.
4. Run the full test suite before opening a PR: `node --test`
5. Run the linter: `npx eslint .`
6. Open a pull request against `main`.

**Never commit directly to `main`.** All changes go through pull requests.

---

## Coding Standards

### Zero Dependencies Policy

fluxguard has a strict zero-production-dependencies policy. Do not add anything to the `dependencies` field in `package.json`. Dev dependencies (linters, etc.) are acceptable but should be proposed in an issue first.

### Style

- 2-space indentation, no tabs
- Single quotes for strings
- Semicolons required
- `'use strict';` at the top of every `.js` file
- No `console.log` in library code
- No `TODO`, `FIXME`, or chain-of-thought comments in committed code

### Clock Abstraction

All time-dependent code must use `src/utils/clock.js` rather than calling `Date.now()` directly. This makes the code deterministically testable. PRs that call `Date.now()` in algorithm or middleware code will not be merged.

### Public API Stability

The interface defined in `CLAUDE.md` under "Core API Contract" is the public surface. Do not add, remove, or rename public methods without opening an issue to discuss the change first. Breaking changes require a major version bump and a migration guide.

---

## Testing Requirements

- Every bug fix must include a regression test that fails before the fix and passes after.
- Every new feature must include tests covering: happy path, edge cases, key isolation, and snapshot round-trip (if the feature touches state).
- Tests must not use real timers (`setTimeout`, `setInterval`) or call `Date.now()` directly — inject a fake clock.
- Tests must use Node.js's built-in `node:test` and `node:assert`. Do not introduce Jest, Mocha, or any other test framework.
- Target: all existing tests continue to pass. PRs that break existing tests without justification will not be reviewed.

Run all tests:

```bash
node --test
```

Run a single file:

```bash
node --test test/token-bucket.test.js
```

---

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `test`, `docs`, `refactor`, `perf`, `chore`

**Examples:**

```
feat(token-bucket): support fractional refill rates
fix(sliding-window): prevent retryAfter returning 0 on rejection
test(leaky-bucket): add key isolation regression test
docs(contributing): clarify clock abstraction requirement
```

- Summary line ≤ 72 characters
- Use the imperative mood: "add support" not "added support"
- Reference issues in the footer: `Closes #42`

---

## Pull Request Process

1. Ensure the test suite passes: `node --test`
2. Ensure the linter passes: `npx eslint .`
3. Fill out the PR template completely — incomplete PRs will be returned.
4. Link the relevant issue in the PR description.
5. Keep PRs focused: one logical change per PR. Large PRs are harder to review and slower to merge.
6. A maintainer will review within a few business days. Address all review comments before the PR is merged.
7. PRs are merged with **squash-and-merge** to keep `main` history clean.

### PR Checklist

- [ ] Tests pass (`node --test`)
- [ ] Linter passes (`npx eslint .`)
- [ ] New/changed behaviour is covered by tests
- [ ] `CLAUDE.md` updated if public API or directory structure changed
- [ ] No new production dependencies added
- [ ] Commit messages follow Conventional Commits format

---

## Reporting Bugs

Open an issue using the **Bug Report** template. Include:

- Node.js version (`node --version`)
- Operating system
- Minimal reproduction case (the smaller the better)
- Expected vs. actual behavior
- Relevant error output or stack trace

---

## Suggesting Features

Open an issue using the **Feature Request** template before writing any code. Describe:

- The problem you are trying to solve
- Why existing algorithms or options don't address it
- A sketch of the proposed API (if applicable)

Features that require adding production dependencies, change the public API contract, or add a fifth algorithm will require maintainer consensus before implementation begins.

---

## License

By contributing to fluxguard, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
