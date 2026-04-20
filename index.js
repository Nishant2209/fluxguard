'use strict';

/**
 * fluxguard — zero-dependency rate limiting library for Node.js
 *
 * Exports four rate-limiting algorithm implementations and a middleware
 * factory for use with Node.js's built-in http module (and compatible
 * frameworks such as Express).
 *
 * Algorithms
 * ----------
 * - TokenBucket      : classic token bucket; supports burst traffic up to
 *                      the bucket capacity, refills at a fixed rate.
 * - LeakyBucket      : smooths traffic to a constant outflow rate;
 *                      excess requests are queued or rejected.
 * - FixedWindow      : counts requests in discrete time windows;
 *                      simple but susceptible to boundary spikes.
 * - SlidingWindowLog : precise per-key rolling window using a timestamp
 *                      log; higher memory cost than fixed-window.
 *
 * Usage
 * -----
 *   const { TokenBucket } = require('fluxguard');
 *
 *   const limiter = new TokenBucket({ capacity: 10, refillRate: 2 });
 *   const result  = limiter.consume('user:42');
 *   if (!result.allowed) {
 *     console.log(`Retry after ${result.retryAfter}ms`);
 *   }
 */

// Algorithm implementations will live in src/ once scaffolded.
// This entry point re-exports everything from one place so callers
// never need to know the internal file layout.

module.exports = {};
