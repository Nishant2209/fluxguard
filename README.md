# fluxguard

> Zero-dependency rate limiting for Node.js — four algorithms, one unified API.

[![Node.js ≥ 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](./package.json)

---

## Why fluxguard?

Most rate limiting libraries pull in Redis, an event loop framework, or a pile of transitive dependencies. fluxguard does not. It is a single library with zero production dependencies that runs on Node.js's built-in APIs. State lives in-process (with optional file-based persistence for restart survival), and the four algorithm implementations share a single composable interface.

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

const limiter = new TokenBucket({
  capacity:   10,   // max tokens in the bucket
  refillRate:  2,   // tokens added per second
});

const result = limiter.consume('user:42');

if (result.allowed) {
  console.log(`Request allowed. ${result.remaining} tokens remaining.`);
} else {
  console.log(`Rate limit exceeded. Retry in ${result.retryAfter}ms.`);
}
```

---

## API

### Common Interface

Every algorithm implements the same interface:

```js
limiter.consume(key, cost?)  // → { allowed, remaining, retryAfter }
limiter.reset(key?)          // reset one key or all keys
limiter.toSnapshot()         // serialize state to a plain object
limiter.fromSnapshot(snap)   // restore state from a snapshot
```

#### `consume(key, cost = 1)`

| Field | Type | Description |
|---|---|---|
| `allowed` | `boolean` | `true` if the request is permitted |
| `remaining` | `number` | Tokens / slots remaining after this call |
| `retryAfter` | `number` | Milliseconds until retry is safe (`0` when `allowed === true`) |

#### `reset(key?)`

Clears the state for a specific key. Omit `key` to reset all keys.

#### `toSnapshot()` / `fromSnapshot(snapshot)`

Serialize and restore in-memory state. Used by the file persistence layer but also useful for debugging or migrating state between processes.

---

## Token Bucket

Refills at a constant rate up to a maximum capacity. Allows short bursts up to the bucket's capacity.

```js
const { TokenBucket } = require('fluxguard');

const limiter = new TokenBucket({
  capacity:   100,  // maximum tokens
  refillRate:  10,  // tokens per second
});

limiter.consume('api-key:xyz');         // cost 1 (default)
limiter.consume('api-key:xyz', 5);      // cost 5 tokens
```

---

## Leaky Bucket

Processes requests at a constant outflow rate. Requests that arrive faster than the outflow rate are queued; once the queue is full they are rejected.

```js
const { LeakyBucket } = require('fluxguard');

const limiter = new LeakyBucket({
  capacity:    20,   // max queue depth
  leakRate:     5,   // requests processed per second
});

limiter.consume('service:payments');
```

---

## Fixed Window

Counts requests in discrete, non-overlapping time windows. Simple and memory-efficient, but susceptible to boundary spikes (a burst at window end + window start can double the effective rate).

```js
const { FixedWindow } = require('fluxguard');

const limiter = new FixedWindow({
  limit:        100,   // max requests per window
  windowMs:   60000,   // window size in milliseconds (60 s)
});

limiter.consume('tenant:acme');
```

---

## Sliding Window Log

Maintains a precise per-key timestamp log. No boundary spike risk. Higher memory cost than Fixed Window — each request is logged individually and pruned when outside the window.

```js
const { SlidingWindowLog } = require('fluxguard');

const limiter = new SlidingWindowLog({
  limit:       10,    // max requests in the window
  windowMs:  1000,    // rolling window in milliseconds (1 s)
});

limiter.consume('ip:192.168.1.1');
```

---

## HTTP Middleware

Works with Node.js's built-in `http` module and any Express-compatible framework.

```js
const http = require('node:http');
const { TokenBucket, createMiddleware } = require('fluxguard');

const limiter    = new TokenBucket({ capacity: 60, refillRate: 1 });
const middleware = createMiddleware(limiter, {
  // extract a per-caller identity from the request
  keyExtractor: (req) =>
    req.headers['x-forwarded-for'] || req.socket.remoteAddress,

  // called when the request is rejected (optional — has a sensible default)
  onRejected: (req, res, result) => {
    res.writeHead(429, {
      'Content-Type':  'text/plain',
      'Retry-After':   Math.ceil(result.retryAfter / 1000),
    });
    res.end('Too Many Requests');
  },
});

http.createServer((req, res) => {
  middleware(req, res, () => {
    res.writeHead(200);
    res.end('OK');
  });
}).listen(3000);
```

### Express

```js
const express = require('express');
const { SlidingWindowLog, createMiddleware } = require('fluxguard');

const app     = express();
const limiter = new SlidingWindowLog({ limit: 100, windowMs: 60_000 });

app.use(createMiddleware(limiter));
app.get('/', (req, res) => res.send('OK'));
app.listen(3000);
```

---

## Persistence

Persist limiter state across process restarts using the built-in file store.

```js
const { TokenBucket, FileStore } = require('fluxguard');

const store   = new FileStore({ path: '/var/lib/myapp/rate-limit.ndjson' });
const limiter = new TokenBucket({ capacity: 100, refillRate: 10, store });

// State is automatically saved on each consume() and restored on startup.
// If the file is missing or corrupted, the limiter starts fresh.
```

The file store uses newline-delimited JSON (NDJSON). Each key's state is one line. The file is written synchronously to guarantee consistency. On startup, the most recent snapshot for each key is loaded; stale entries are pruned.

---

## Composite Limiting

Apply multiple rules to the same key. All rules must pass for the request to be allowed.

```js
const { TokenBucket, FixedWindow, compose } = require('fluxguard');

const perSecond = new TokenBucket({ capacity: 10,  refillRate: 10  });
const perDay    = new FixedWindow({ limit: 10_000,  windowMs: 86_400_000 });

const limiter = compose(perSecond, perDay);
const result  = limiter.consume('user:99');
// result.retryAfter is the maximum of all individual retryAfter values
```

---

## Development

```bash
git clone https://github.com/<your-org>/fluxguard.git
cd fluxguard

# Run all tests (no install needed — zero dependencies)
node --test

# Run a single file
node --test test/token-bucket.test.js

# Lint
npx eslint .
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.

---

## Design Decisions

**Why no external dependencies?**
Rate limiters are infrastructure. Adding a transitive dependency chain to infrastructure increases your attack surface and maintenance burden. Everything fluxguard needs is already in Node.js 18+.

**Why a clock abstraction instead of `Date.now()`?**
All time-sensitive code in fluxguard goes through a mockable `Clock` object. This means tests can simulate the passage of time deterministically — no flaky `setTimeout`-based tests, no `sleep()` calls in the test suite.

**Why four algorithms instead of one "smart" one?**
Each algorithm has different tradeoffs. Token Bucket is the right call for most APIs; Leaky Bucket is right for payment processors that need constant throughput; Sliding Window Log is right when fairness over time matters more than memory. Hiding these differences behind a single algorithm would be a leaky abstraction.

---

## License

[MIT](./LICENSE) © fluxguard contributors
