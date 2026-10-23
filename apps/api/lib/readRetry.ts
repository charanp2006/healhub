import mongoose from "mongoose";

// Idle sockets can be closed by NAT, the host, or Atlas's front end. When that
// happens the first read after an idle period fails with a transient network
// error even though the topology monitor reconnects moments later. Retrying the
// read once after a short pause gives the driver time to re-select a server.
const RETRY_DELAY_MS = 400;

const RETRYABLE_READ_OPS = new Set([
  "find",
  "findOne",
  "countDocuments",
  "estimatedDocumentCount",
  "distinct",
]);

// Connection-level failures only. Query/validation errors must surface as-is.
const TRANSIENT_ERROR_NAMES = new Set([
  "MongoServerSelectionError",
  "MongoNetworkError",
  "MongoNetworkTimeoutError",
  "MongoServerClosedError",
  "MongoTopologyClosedError",
  "MongoNotConnectedError",
  "MongoOperationTimeoutError",
  "MongooseServerSelectionError",
]);

const TRANSIENT_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ECONNABORTED",
  "ETIMEDOUT",
  "EPIPE",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  // Server-side transient states (node restarting, stepping down, shutting down).
  "91",
  "189",
  "9001",
  "10107",
  "11600",
  "11602",
  "13435",
  "13436",
]);

type SessionCarrier = {
  options?: { session?: unknown };
  _mongooseOptions?: { session?: unknown };
};

type QueryLike = SessionCarrier & {
  op?: string;
  clone?: () => unknown;
};

type AggregateLike = SessionCarrier & {
  pipeline?: () => unknown[];
};

type ExecLike = (this: unknown, ...args: unknown[]) => Promise<unknown>;

interface ErrorShape {
  name?: string;
  code?: string | number;
  cause?: unknown;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableReadOp(op: string | undefined): boolean {
  return op != null && RETRYABLE_READ_OPS.has(op);
}

export function isTransientConnectionError(error: unknown): boolean {
  let current = error as ErrorShape | undefined;

  for (let depth = 0; current != null && depth < 5; depth++) {
    if (typeof current === "object") {
      if (current.name && TRANSIENT_ERROR_NAMES.has(current.name)) return true;
      if (current.code != null && TRANSIENT_ERROR_CODES.has(String(current.code))) {
        return true;
      }
    }
    current = current.cause as ErrorShape | undefined;
  }

  return false;
}

function describeError(error: unknown): string {
  const shape = error as ErrorShape | undefined;
  const parts = [shape?.name, shape?.code].filter(
    (part): part is string | number => part != null
  );
  return parts.length ? parts.join("/") : "unknown error";
}

function hasSession(target: SessionCarrier | undefined): boolean {
  return target?.options?.session != null || target?._mongooseOptions?.session != null;
}

function isWriteStage(stage: unknown): boolean {
  if (stage == null || typeof stage !== "object") return false;
  return "$out" in stage || "$merge" in stage;
}

export async function withReadRetry<T>(
  operation: () => Promise<T>,
  retryDelayMs = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientConnectionError(error)) throw error;

    console.warn(
      `[db] transient read failure (${describeError(error)}); retrying once in ${retryDelayMs}ms`
    );
    await delay(retryDelayMs);
    return operation();
  }
}

type GlobalWithReadRetry = typeof globalThis & {
  __healhubReadRetryInstalled?: boolean;
};

export function installReadRetry(): void {
  const globalScope = globalThis as GlobalWithReadRetry;
  if (globalScope.__healhubReadRetryInstalled) return;
  globalScope.__healhubReadRetryInstalled = true;

  const queryPrototype = mongoose.Query.prototype as unknown as { exec: ExecLike };
  const originalQueryExec = queryPrototype.exec;

  queryPrototype.exec = function patchedQueryExec(this: unknown, ...args: unknown[]) {
    const query = this as QueryLike;

    // Sessions belong to transactions: a retry could replay a read against a
    // transaction that has already been aborted, so never retry those.
    if (!isRetryableReadOp(query.op) || hasSession(query)) {
      return originalQueryExec.apply(this, args);
    }

    let firstAttempt = true;
    return withReadRetry(() => {
      const target = firstAttempt ? this : query.clone?.() ?? this;
      firstAttempt = false;
      return originalQueryExec.apply(target, args);
    });
  };

  const aggregatePrototype = mongoose.Aggregate.prototype as unknown as { exec: ExecLike };
  const originalAggregateExec = aggregatePrototype.exec;

  aggregatePrototype.exec = function patchedAggregateExec(this: unknown, ...args: unknown[]) {
    const aggregate = this as AggregateLike;
    const pipeline = typeof aggregate.pipeline === "function" ? aggregate.pipeline() : [];

    // `$out` / `$merge` make an aggregate a write; treat everything else as a read.
    if (hasSession(aggregate) || pipeline.some(isWriteStage)) {
      return originalAggregateExec.apply(this, args);
    }

    return withReadRetry(() => originalAggregateExec.apply(this, args));
  };
}
