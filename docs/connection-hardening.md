# MongoDB connection hardening & free-host cold starts

> Applies to: `apps/api` — Next.js 16 Route Handlers (webpack), **Mongoose 8.21**, MongoDB Atlas, hosted on **Render free** (`render.yaml`).

This document covers two independent problems that look alike:

1. The API hangs or errors on the first request after an idle period.
2. The whole site is slow to respond because the Render free service was spun down.

Fixing one does **not** fix the other.

---

## 1. Problem: "Atlas drops my connection after a few hours/days"

### Symptom

- Everything works, then after an idle period the first request hangs (~30 s) or fails with `MongooseServerSelectionError` / `MongoServerSelectionError` / `MongoNetworkTimeout`, then works again.
- Atlas shows the cluster **Active**, but the connection count is zero.

### Root cause

This is not Atlas going down. Three things combine:

1. **Idle TCP sockets are closed** by NAT, a load balancer, the host, or Atlas's front end. The driver's pool kept those sockets open indefinitely (`maxIdleTimeMS` defaults to no limit) and reused a socket that was already dead.
2. The **default server-selection timeout is ~30 s**, so the first request hangs instead of failing fast.
3. The app had **no app-level retry**, so a single dropped socket surfaced as a user-facing error.

It is **not**:

- the Atlas free-tier connection limit (Free/Flex = 500 connections per node), or
- the 30-day inactivity auto-pause (that only happens after 30 days with zero connections).

Atlas reporting **0 connections while idle is normal** with `minPoolSize: 0` + `maxIdleTimeMS: 45000`.

### What changed

The client is created in `apps/api/lib/db.ts`. The URI is untouched; options are passed as Mongoose `ConnectOptions` (never appended to the connection string, which already carries `retryWrites`/`w`/`appName` and would raise a duplicate-key error if repeated).

`apps/api/lib/db.ts:88`:

| Option | Value | Why |
|---|---|---|
| `serverSelectionTimeoutMS` | `5000` | Fail within 5 s instead of hanging ~30 s. |
| `connectTimeoutMS` | `10000` | Bound the TCP/TLS handshake. |
| `socketTimeoutMS` | `45000` | Never wait forever on a dead socket; prevents truly infinite hangs. |
| `maxPoolSize` | `50` | Cap sockets per API instance (watch Atlas connection limits when scaling). |
| `minPoolSize` | `0` | Hold no connections while idle. |
| **`maxIdleTimeMS`** | **`45000`** | **Key fix:** close idle sockets before the network/Atlas does, so a dead socket is never reused. |
| `retryWrites` / `retryReads` | `true` | Keep the driver's built-in idempotent retries. |
| `family` | `4` | Existing repo workaround for networks that silently drop IPv6. |

`bufferCommands: false` is set separately at `apps/api/lib/db.ts:85` so queries fail fast instead of buffering for ~10 s.

**One shared client.** `apps/api/lib/db.ts:74` stores the connection on `globalThis.mongooseGlobal`, and `connectDB()` (`db.ts:104`) returns the cached connection when `readyState === 1`, with single-flight protection for concurrent requests. No client is created per request, and nothing is opened/closed per request.

---

## 2. Read-only retry on dropped connections

`apps/api/lib/readRetry.ts` wraps Mongoose read execution once, at process start, via `installReadRetry()` called from `apps/api/lib/db.ts:4`.

- Retryable operations: `find`, `findOne` (including `findById`), `countDocuments`, `estimatedDocumentCount`, `distinct`, and read-only `aggregate()` pipelines.
- Retry policy: on a transient connection error, wait **400 ms**, retry **once**. One `console.warn` is emitted per retry:
  `[db] transient read failure (MongoNetworkError); retrying once in 400ms`
- Transient detection is by error **name** (`MongoServerSelectionError`, `MongoNetworkError`, `MongoNetworkTimeoutError`, `MongoServerClosedError`, `MongoTopologyClosedError`, `MongoNotConnectedError`, `MongooseServerSelectionError`, `MongoOperationTimeoutError`) and **code** (`ECONNRESET`, `ETIMEDOUT`, `EPIPE`, `ENOTFOUND`, `EHOSTUNREACH`, `ENETUNREACH`, etc., plus server transient codes such as `91`, `189`, `11600`, `11602`, `13435`, `13436`). Nested `cause` chains are inspected.
- Retries use a **clone** of the Mongoose query, because Mongoose marks a query instance as already executed after the first attempt.
- **Writes are never retried** — not `findOneAndUpdate`, `findOneAndDelete`, `findOneAndReplace`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, or `insertMany`. A retry on a non-idempotent write (for example, decrementing bed availability, claiming a slot, or creating an order) could apply it twice. The driver's own retryable writes already handle dropped writes idempotently.
- **Transactions are never retried.** Queries with a session (`bedController` transactions) are skipped, because replaying an operation against an aborted transaction is incorrect.
- Aggregates containing `$out` or `$merge` are treated as writes and skipped.

If a write ever genuinely needs an app-level retry, it needs an **idempotency key** so the server can detect a duplicate.

---

## 3. Health endpoint

`apps/api/app/api/health/route.ts` (`GET /api/health`):

- **Always returns `200`** with `{"success":true,"status":"ok","db":"connected"|"disconnected"}`.
- A database outage never fails the health check; the DB probe is best-effort and capped at **2 s**.
- This is the target for Render health checks and external keep-alive monitors.
- Render's configured `healthCheckPath` in `render.yaml` is already `/api/health`.

---

## 4. Problem: Render free cold starts

These are Render free-tier facts, confirmed against the service config in `render.yaml` (`plan: free`, `region: singapore`, `healthCheckPath: /api/health`):

- Free web services **spin down after 15 minutes** without inbound traffic.
- The next request triggers a **~1 minute cold start**.
- A workspace gets **750 free instance-hours per calendar month**.
- A month is ~730–744 hours, so 750 hours is enough for **exactly one always-on service**.
- Exceeding 750 hours **suspends all free services** until the next month. Hours reset monthly and do **not** roll over.
- Spun-down time does **not** consume instance-hours.
- The filesystem is **ephemeral**.
- Paid **Starter (~$7/month)** removes spin-down and the hour cap.

This is separate from the MongoDB issue above. A Render cold start kills the process and its DB sockets; a DB setting cannot prevent it.

### Fix applied / recommended

**Keep-alive (recommended for free tier).** Point an external monitor at `GET /api/health` every **≤14 minutes** so the service never reaches the 15-minute idle threshold. Any of these work:

- cron-job.org
- UptimeRobot
- Better Stack
- a GitHub Actions scheduled workflow (`on: schedule:`) — note GitHub's minimum interval is 5 minutes but scheduled runs can be delayed, so `*/10` or `*/14` is more reliable for this purpose.

No workflow was added to this repository. Configure the monitor in the provider's dashboard (or ask for the workflow file to be added).

**Paid tier.** Upgrading the Render service to Starter removes spin-down and the hour cap. Documented only; no code change.

**Warning:** running multiple always-on free services, or pinging more often than necessary, burns the shared 750-hour monthly allowance and can suspend **all** free services until the next month. One service pinged every 10–14 minutes already consumes close to the full month (~730 h), so do not run a second always-on free service in the same workspace.

### Why both fixes are needed

- `maxIdleTimeMS` prevents dead Mongo sockets from being reused, but it cannot wake a spun-down Render process.
- A keep-alive prevents Render spin-down, but it cannot stop a reused dead Mongo socket.
- With `minPoolSize: 0` and `maxIdleTimeMS: 45000`, Atlas will still show **0 connections while idle**. That is expected and healthy.

---

## 5. Verification

Run from the repository root:

```bash
# Health check (replace with the deployed API host)
curl -i https://<api-host>/api/health
# Expected: HTTP 200
# {"success":true,"status":"ok","db":"connected"}

# Retry classification / policy (no database required)
npm run test:read-retry -w apps/api
# Expected: 9/9 passed

# Existing availability tests still pass
npm run test:availability -w apps/api
# Expected: 21/21 passed

# Static checks
npm run typecheck
npm run lint
npm run build
```

Functional check:

1. Open the site, load a page that performs a real read (for example doctors or appointments).
2. Leave it idle for longer than the 45 s idle timeout.
3. Load it again. Expect a normal response; if a retry fired, the API log contains one `[db] transient read failure (...)` warning followed by a successful request.

Confirm the connection string was not modified:

```bash
git diff apps/api/lib/db.ts
# Only ConnectOptions changed; no URI/credential edits.
```

---

## 6. Tuning guidance

- **Traffic increases:** raise `maxPoolSize` per instance and verify `instances × maxPoolSize` stays below the Atlas tier limit (Free/Flex = 500/node). Add `minPoolSize` only if cold-query latency matters and you accept idle Atlas connections.
- **Frequent server-selection timeouts:** lower `serverSelectionTimeoutMS` for faster failure, or raise it slightly if the Atlas cluster/network is slow to recover (for example, waking after a pause). Do not return to the ~30 s default.
- **Long analytics queries:** `socketTimeoutMS: 45000` will abort a single operation that is silent for 45 s. Raise it only for known-heavy report endpoints; keep it finite.
- **`maxIdleTimeMS`:** keep it below the network/load-balancer idle timeout (typically 60 s+). `45000` is a safe default; lower values increase reconnect churn, higher values risk reusing a dead socket.
- **Read retry delay:** `400 ms` (`RETRY_DELAY_MS` in `apps/api/lib/readRetry.ts:7`) is enough for the topology monitor to start re-selecting. Do not add looped retries; one retry is intentional.

---

## 7. Notes

- The connection string is **unchanged**; all settings are `ConnectOptions` at `apps/api/lib/db.ts:88`.
- `apps/api/lib/db.ts` still contains the DNS-over-HTTPS SRV/TXT workaround and `family: 4`; both were preserved.
- The older `docs/mongodb-connection-disconnects.md` is retained for history but is superseded by this document. In particular, its claim that Atlas free clusters pause after ~60 minutes is incorrect — the auto-pause is based on 30 days of inactivity.
