import assert from "node:assert/strict";
import mongoose from "mongoose";
import {
  isRetryableReadOp,
  isTransientConnectionError,
  withReadRetry,
} from "../lib/readRetry";

function transientError(name: string, code?: string) {
  const error = new Error("simulated connection failure") as Error & {
    name: string;
    code?: string;
  };
  error.name = name;
  if (code) error.code = code;
  return error;
}

const tests: Array<[string, () => void | Promise<void>]> = [];
const test = (name: string, fn: () => void | Promise<void>) => tests.push([name, fn]);

test("retries a transient read failure exactly once and succeeds", async () => {
  let calls = 0;
  const result = await withReadRetry(async () => {
    calls++;
    if (calls === 1) throw transientError("MongoNetworkError");
    return "ok";
  }, 0);

  assert.equal(result, "ok");
  assert.equal(calls, 2);
});

test("does not retry a non-transient error", async () => {
  let calls = 0;
  await assert.rejects(
    withReadRetry(async () => {
      calls++;
      throw new Error("document failed validation");
    }, 0)
  );

  assert.equal(calls, 1);
});

test("stops after one retry when the second attempt also fails", async () => {
  let calls = 0;
  await assert.rejects(
    withReadRetry(async () => {
      calls++;
      throw transientError("MongoServerSelectionError");
    }, 0)
  );

  assert.equal(calls, 2);
});

test("recognises connection errors by name", () => {
  for (const name of [
    "MongoServerSelectionError",
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
    "MongoServerClosedError",
    "MongoTopologyClosedError",
    "MongoNotConnectedError",
    "MongooseServerSelectionError",
  ]) {
    assert.equal(isTransientConnectionError(transientError(name)), true, name);
  }
});

test("recognises connection errors by nested cause code", () => {
  const error = new Error("outer") as Error & { cause?: unknown };
  error.cause = transientError("Error", "ECONNRESET");

  assert.equal(isTransientConnectionError(error), true);
  assert.equal(isTransientConnectionError(transientError("Error", "ETIMEDOUT")), true);
});

test("ignores unrelated errors", () => {
  assert.equal(isTransientConnectionError(new Error("nope")), false);
  assert.equal(isTransientConnectionError(transientError("ValidationError")), false);
  assert.equal(isTransientConnectionError(undefined), false);
});

test("retries read operations only", () => {
  for (const op of ["find", "findOne", "countDocuments", "estimatedDocumentCount", "distinct"]) {
    assert.equal(isRetryableReadOp(op), true, op);
  }

  for (const op of [
    "findOneAndUpdate",
    "findOneAndDelete",
    "findOneAndReplace",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
    "insertMany",
  ]) {
    assert.equal(isRetryableReadOp(op), false, op);
  }

  assert.equal(isRetryableReadOp(undefined), false);
});

test("logs a warning once when a retry fires", async () => {
  const originalWarn = console.warn;
  const warnings: string[] = [];
  console.warn = (message?: unknown) => {
    warnings.push(String(message));
  };

  try {
    let calls = 0;
    await withReadRetry(async () => {
      calls++;
      if (calls === 1) throw transientError("MongoNetworkError");
      return "ok";
    }, 0);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /transient read failure/);
});

test("a cloned query can re-run without Mongoose's already-executed guard", async () => {
  mongoose.set("bufferCommands", false);
  const Model =
    mongoose.models.RetryCloneProbe ??
    mongoose.model("RetryCloneProbe", new mongoose.Schema({ name: String }));

  const query = Model.findOne({ name: "probe" });
  await assert.rejects(query.exec());

  const clone = query.clone();
  await assert.rejects(
    clone.exec(),
    (error: Error) => !/already executed/i.test(error.message)
  );
});

async function main() {
  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`  ok  ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL  ${name}`);
      console.error(`      ${(error as Error).message.split("\n")[0]}`);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} passed`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
