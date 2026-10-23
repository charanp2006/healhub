export const runtime = "nodejs";

import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { handleOptions, ok } from "@/lib/http";

const DB_PING_TIMEOUT_MS = 2000;

// Shallow, best-effort ping. A slow or unavailable database must never make the
// health check fail: Render uses this endpoint for liveness and keep-alive
// monitors poll it, so it always returns 200.
async function pingDatabase(): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), DB_PING_TIMEOUT_MS);

    connectDB()
      .then(async () => {
        const db = mongoose.connection.db;
        if (!db) return resolve(false);
        await db.admin().command({ ping: 1 });
        resolve(true);
      })
      .catch(() => resolve(false))
      .finally(() => clearTimeout(timer));
  });
}

export async function GET(request: Request) {
  const connected = await pingDatabase();
  return ok({ status: "ok", db: connected ? "connected" : "disconnected" }, request);
}

export { handleOptions as OPTIONS };
