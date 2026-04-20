# fluxguard

> Zero-dependency rate limiting for Node.js — four algorithms, one unified API.

[![Node.js ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](./package.json)

---

## Why fluxguard?

Most rate limiting libraries pull in Redis, an event loop framework, or a pile of transitive dependencies. fluxguard does not. It is a single library with zero production dependencies that runs on Node.js's built-in APIs.

---

## Algorithms

| Algorithm | Best For | Burst Handling |
|---|---|---|
| **Token Bucket** | General-purpose API rate limiting | Yes — up to bucket capacity |
| **Leaky Bucket** | Smoothing bursty traffic to a constant outflow | No — excess queued or dropped |
| **Fixed Window** | Simple per-minute/per-hour counters | Boundary spike risk |
| **Sliding Window Log** | Precise rolling windows (e.g. "10 req / 60 s") | No — exact enforcement |

---

## Installation

```bash
npm install fluxguard
```

Requires **Node.js ≥ 18.0.0**. No other runtime requirements.

---

## Quick Start

```js
const { TokenBucket } = require('fluxguard');

const limiter = new TokenBucket({ capacity: 10, refillRate: 2 });
const result  = limiter.consume('user:42');

if (!result.allowed) {
  console.log(`Retry in ${result.retryAfter}ms`);
}
```

---

## Development

```bash
git clone https://github.com/<your-org>/fluxguard.git
cd fluxguard
node --test   # no install step needed
npx eslint .
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.

---

## License

[MIT](./LICENSE) © fluxguard contributors
