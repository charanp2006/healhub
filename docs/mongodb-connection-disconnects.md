# MongoDB Atlas "automatic disconnect" — root cause & fix

> Applies to: `apps/api` (Next.js 16 Route Handlers, webpack on port 4000), Mongoose 8, Atlas `mongodb+srv://` cluster.

## TL;DR

Nothing "disconnects" randomly. The MongoDB driver is designed to stay connected and reconnect on its own. What you are seeing is one of four real behaviors, and this repo's `db.ts` makes **all of them worse** because it:

1. connects with **no mongoose options** (defaults: `maxPoolSize: 100`, `serverSelectionTimeoutMS: 30s`),
2. registers **zero event listeners** (no visibility into what happened),
3. caches a connected promise **forever** and never checks `mongoose.connection.readyState`, so a dead topology looks "connected" and queries hang silently then throw,
4. does no keep-alive or health check.

The recommended fix (Section 4) turns `db.ts` into a **self-healing, monitored, properly-configured** connection that recovers automatically from all four causes below.

---

## 1. Symptoms typically reported

- After a quiet period, the first request of the day fails with `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`, then works on retry.
- Queries suddenly hang for ~30 seconds then error (`buffering timed out` / `server selection timed out`).
- Atlas shows connection count oscillating, or the cluster shows **Status: Paused**.
- Errors reference `ECONNRESET`, `ETIMEDOUT`, `querySrv ECONNREFUSED` (the SRV one is already special-cased here via the DoH workaround).

---

## 2. Root-cause analysis (ranked by likelihood)

### 2.1 Atlas **M0 / M2 free & shared tiers auto-pause after ~60 min idle**
This is by far the most common cause on free clusters. Atlas pauses *shared* (M0/M2) clusters after ~60 minutes of inactivity and spins them back up on the next connection attempt. Resume takes **15–60 s**, so the *first* request after idle fails `server selection` while the cluster wakes, and the driver's default `serverSelectionTimeoutMS` (30 s) may not be enough.

**Proof:** Atlas console → cluster card shows `Paused`; activity log shows `Cluster paused`.

### 2.2 Stale singleton: `db.ts` returns a dead connection forever
```ts
if (cached.conn) return cached.conn;   // readyState may be 0 (disconnected) here
```
Once the underlying socket drops (NAT idle-timeout, host free-tier shutdown, local laptop sleep, brief network blip), `mongoose.connection.readyState` flips to `0`, but `connectDB()` keeps returning the cached object. Combined with mongoose's default `bufferCommands: true`, every query is silently **buffered for 30 s**, then fails with `buffering timed out`. The code never re-runs `mongoose.connect()`, because `cached.conn` is truthy.

### 2.3 Idle socket termination by firewall / NAT / tunnel
Local dev behind Windows firewall, VPN, or a tunnel: middleware drops idle TCP connections (typically paused sockets > 1–10 min). The driver's monitoring heartbeats (`heartbeatFrequencyMS: 10s` default) *should* notice and reconnect — but only if the topology object is still alive, which brings us back to 2.2. A stale cached conn prevents the healthy reconnection path from running.

### 2.4 Host / process lifecycle (production hosting, not the DB)
On free hosting (Render, Railway, Vercel Hobby) the **process itself is killed after idle** and the socket dies with it. From the app's perspective it looks like "MongoDB disconnected"; in reality the whole server exited. No driver setting fixes this — you need a keep-alive that wakes the process, or paid always-on hosting.

### 2.5 Connection-limit churn (secondary)
`maxPoolSize` defaults to **100 per process**. If you ever run more than one API instance, or Next spawns multiple worker contexts, you multiply connections against the Atlas shared-tier cap and get `ECONNREFUSED 0x24` (too many open connections). Keep the pool small.

---

## 3. Diagnostic checklist (confirm *your* cause in 5 minutes)

| Check | How | Cause if… |
|---|---|---|
| Cluster tier & pause | Atlas UI → cluster → tier | M0/M2 & `Status: Paused` → **2.1** |
| readyState fail pattern | Add the health route from §4, hit `/api/health` after idle | `readyState` says `0`/`2` while app "works" → **2.2** |
| ECONNRESET bursts | Server logs | Solitary, after idle → **2.3** |
| Process restarts | Host dashboard (Render/Railway) restart counter | Restart count grows with no code change → **2.4** |
| Direct mongosh test | `mongosh "mongodb+srv://…" --eval 'db.runCommand({ping:1})'` (cold) | Fails once, succeeds on 2nd call → **2.1** |
| Duplicate pools | Atlas → Real-Time / Metrics → connections per app | > 100 with one instance, or count jumps per request → **2.5** |

---

## 4. Recommended fix (implement)

Two changes, all inside `apps/api/lib/db.ts`:

### 4.1 Pass explicit, Atlas-friendly connection options

```ts
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 20_000, // M0 resume can take 15–60s; 20s keeps failures fast
  connectTimeoutMS: 10_000,
  heartbeatFrequencyMS: 10_000,     // default; explicit for clarity
  maxPoolSize: 10,                  // shared-tier friendly; enough for this API
  minPoolSize: 0,
  bufferCommands: false,            // fail fast instead of silently buffering 30s
  appName: "healhub-api",           // appears in Atlas activity log
  retryWrites: true,
  retryReads: true,
} as const;
```

`bufferCommands: false` is the important one: while disconnected, queries throw **immediately** instead of hanging — which is exactly what makes the self-healing path in 4.2 work and makes failures visible instead of silent.

### 4.2 Self-healing `connectDB` + driver event monitoring

```ts
const cached =
  globalThis.mongooseGlobal ?? (globalThis.mongooseGlobal = { promise: null });

export async function connectDB() {
  const state = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  if (state === 1) return mongoose;

  if (state === 2) {
    // A connect is already in flight; wait for it.
    if (cached.promise) await cached.promise;
    return mongoose;
  }

  // state 0 or 3 → stale/dead topology → start a fresh connection.
  cached.promise = null;
  const uri = resolvedURI ?? (resolvedURI = await resolveMongoURI());
  cached.promise = mongoose.connect(uri, MONGO_OPTIONS);
  try {
    await cached.promise;
  } catch (e) {
    cached.promise = null; // allow the next call to retry
    throw e;
  }
  return mongoose;
}

// Only attach once, even across HMR/hot-reloads.
let listenersAttached = false;
function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on("connected",    () => console.log("[mongo] connected"));
  mongoose.connection.on("disconnected", () => console.warn("[mongo] disconnected — will reconnect on next request/keepalive"));
  mongoose.connection.on("reconnected",  () => console.log("[mongo] reconnected"));
  mongoose.connection.on("error",        (err) => console.error("[mongo] error:", err?.message ?? err));
}
attachListeners();
```

**Why this fixes 2.2/2.3:** every controller already calls `await connectDB()` — now that call checks real state. If the driver auto-reconnected, `readyState` is already `1` and we return instantly. If the topology died, we rebuild it on the spot instead of returning a zombie.

### 4.3 Optional keep-alive ping (fixes 2.1 idle-pause & 2.4 host idle)

```ts
let keepAliveStarted = false;
export function startKeepAlive(intervalMs = 4 * 60 * 1000) {
  if (keepAliveStarted) return;
  keepAliveStarted = true;
  setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return; // self-heal handles it
    try { await mongoose.connection.db.admin().ping(); } catch {}
  }, intervalMs).unref(); // unref: never block process shutdown
}
```

Call `startKeepAlive()` once at first successful connect (module scope after `attachListeners`). It sends a ping every 4 minutes — below Atlas's ~60-min pause threshold — and keeps the process's socket alive. `.unref()` means it won't keep a server alive by itself.

### 4.4 Health route (visibility)

`apps/api/app/api/health/route.ts`:

```ts
import { NextResponse } from "next/server";

const STATES = ["disconnected", "connected", "connecting", "disconnecting"];

export async function GET() {
  await import("@/lib/db"); // ensure listeners are attached
  return NextResponse.json({
    ok: mongoose.connection.readyState === 1,
    readyState: STATES[mongoose.connection.readyState] ?? mongoose.connection.readyState,
  });
}
```

---

## 5. Also worth fixing while in there

- **DoH URI builder breaks on special-char passwords.** Atlas-generated URIs can contain `@` / `:` in the password. `userInfo` is taken from `RAW_URI.split("@")[0]`, so a password containing `@` silently truncates the credentials in the DoH path. Build `userInfo` from `encodeURIComponent(user)` + `encodeURIComponent(pass)` split on the **first** `@` only, and only rewrite the host part:
  ```ts
  const at = RAW_URI.indexOf("@");            // first @ separates creds from host
  const userInfo = RAW_URI.slice("mongodb+srv://".length, at);
  const baseHost = RAW_URI.slice(at + 1).split("/")[0];
  ```
- **`serverSelectionTimeoutMS` vs Resume:** 20 s is a good middle ground. Raising it to 30–60 s smooths M0 resumes but makes failures feel like hangs.
- **Vercel/Render + serverless:** if the API ever deploys to a serverless runtime, `setInterval` runtimes are cold — the on-demand reconnect in 4.2 is the primary fix there, keep-alive is best-effort.

---

## 6. What we already do right (keep)

- The DoH(SRV/TXT)-over-Cloudflare workaround sidesteps the `querySrv ECONNREFUSED` resolver problem — keep it, but apply §5's parse fix.
- Global cache pattern avoids re-connecting per request once the code above checks real state.
- Single connect site (`lib/db.ts`) used by all controllers — one pool to reason about.

## 7. Expected result after the fix

- First request after idle: components fail fast (no 30 s black-holes) → self-heal reconnects → response returns in ~1–3 s post-resume.
- `/api/health` always reflects the true state; logs show a clear `disconnected → reconnected` story instead of mystery timeouts.
- On M0, the ping keeps the cluster from pausing (or the cluster pauses idly only if the process is down too — then the first request wakes it and 4.2 carries it through).