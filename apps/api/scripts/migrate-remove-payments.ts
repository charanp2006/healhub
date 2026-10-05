// Migration: remove the retired payment/billing data left behind in MongoDB.
//
//   The Razorpay gateway and the billing module were deleted from the app.
//   Code and schema no longer read `appointment.payment` or the `billings`
//   collection, but the documents are still in the database. This script
//   audits them and optionally cleans them up.
//
//   IMPORTANT: this script defaults to AUDIT ONLY. It prints counts and
//   changes nothing. Every mutation requires an explicit flag.
//
//   Usage (run from apps/api):
//     npm run migrate:payments              # audit only, changes nothing
//     npm run migrate:payments -- --backfill-completed
//     npm run migrate:payments -- --archive-billings
//     npm run migrate:payments -- --drop-billings
//
//   Flags (combinable, all require the run to be opted in):
//     --backfill-completed  Set isCompleted=true on appointments that were
//                           paid but never completed, so historical revenue
//                           stays intact after payment removal.
//     --unset-payment       Remove the `payment` field from all appointments.
//     --archive-billings    Rename `billings` -> `billings_archived_<date>`
//                           (data preserved, nothing read by the app).
//     --drop-billings       Delete the `billings` collection outright.
//     --yes                 Skip the interactive confirmation prompt.
//
//   Takes a safety backup path: always run against a snapshot first, and
//   prefer `--archive-billings` over `--drop-billings` until you are sure.

import mongoose from "mongoose";
// Must be first so MONGODB_URI is populated before ../lib/db.js reads it.
import "dotenv/config";
// Reuse the app's own connector so this script targets exactly the same
// database as the running API (same SRV/DoH resolution, same db name).
import { connectDB } from "../lib/db.js";

const args = new Set(process.argv.slice(2));
const MUTATING =
  args.has("--backfill-completed") ||
  args.has("--unset-payment") ||
  args.has("--archive-billings") ||
  args.has("--drop-billings");

const ARCHIVE_TAG = `billings_archived_${new Date().toISOString().slice(0, 10)}`;

async function main() {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database handle — is MONGODB_URI set?");

  const appointments = db.collection("appointments");

  // --- Audit ---------------------------------------------------------------
  console.log("\n=== HealHub payment/billing data audit ===\n");
  console.log(`Database: ${db.databaseName}`);
  console.log(`Mode:     ${MUTATING ? "MUTATING" : "AUDIT ONLY (no changes will be made)"}\n`);

  const totalAppointments = await appointments.estimatedDocumentCount();
  const withPaymentField = await appointments.countDocuments({
    payment: { $exists: true },
  });
  const paidTrue = await appointments.countDocuments({ payment: true });
  const paidNotCompleted = await appointments.countDocuments({
    payment: true,
    isCompleted: false,
  });
  // The set whose historical revenue silently disappears without a backfill.
  const paidActiveNotCompleted = await appointments.countDocuments({
    payment: true,
    isCompleted: false,
    cancelled: false,
  });

  let billingsCount = 0;
  const billingsExists = (await db.listCollections({ name: "billings" }).toArray()).length > 0;
  if (billingsExists) {
    billingsCount = await db.collection("billings").estimatedDocumentCount();
  }

  console.log("appointments collection");
  console.log(`  total documents              : ${totalAppointments}`);
  console.log(`  have a \`payment\` field      : ${withPaymentField}`);
  console.log(`  payment === true             : ${paidTrue}`);
  console.log(`  paid but NOT completed       : ${paidNotCompleted}`);
  console.log(`  ...of those, not cancelled   : ${paidActiveNotCompleted}`);
  console.log("\nbillings collection");
  console.log(`  exists                       : ${billingsExists}`);
  console.log(`  documents                    : ${billingsCount}`);

  const paymentIndexes = (await appointments.indexes())
    .map((i) => i.name ?? "")
    .filter((n) => /payment/i.test(n));
  if (paymentIndexes.length) {
    console.log(`\npayment-related indexes       : ${paymentIndexes.join(", ")}`);
  }

  if (paidActiveNotCompleted > 0) {
    console.log(
      `\n  NOTE: ${paidActiveNotCompleted} appointment(s) were paid but never` +
        "\n        completed. Revenue now counts isCompleted only, so these" +
        "\n        no longer contribute. Use --backfill-completed to keep" +
        "\n        historical revenue accurate."
    );
  }

  if (!MUTATING) {
    console.log("\n--- No changes made. Re-run with a flag to apply. ---\n");
    await mongoose.disconnect();
    return;
  }

  // --- Confirm -------------------------------------------------------------
  if (!args.has("--yes")) {
    console.log("\nFlags present: " +
      [...args].filter((a) => a.startsWith("--") && a !== "--yes").join(", "));
    const answer = process.argv.includes("--force")
      ? "y"
      : await prompt("Type 'yes' to continue: ");
    if ((answer || "").trim().toLowerCase() !== "yes") {
      console.log("Aborted. No changes made.");
      await mongoose.disconnect();
      return;
    }
  }

  // --- Apply ---------------------------------------------------------------
  if (args.has("--backfill-completed")) {
    const res = await appointments.updateMany(
      { payment: true, isCompleted: false, cancelled: false },
      { $set: { isCompleted: true } }
    );
    console.log(`\n[backfill] isCompleted set on ${res.modifiedCount} appointment(s)`);
  }

  if (args.has("--unset-payment")) {
    const res = await appointments.updateMany(
      { payment: { $exists: true } },
      { $unset: { payment: "" } }
    );
    console.log(`[unset]    \`payment\` removed from ${res.modifiedCount} appointment(s)`);
  }

  if (args.has("--archive-billings") && billingsExists) {
    await db.collection("billings").rename(ARCHIVE_TAG);
    console.log(`[archive]  billings -> ${ARCHIVE_TAG} (data preserved)`);
  }

  if (args.has("--drop-billings") && billingsExists) {
    await db.collection("billings").drop();
    console.log("[drop]     billings collection deleted");
  }

  // --- Verify --------------------------------------------------------------
  console.log("\n=== Post-migration verification ===");
  console.log(`  payment field remaining      : ${await appointments.countDocuments({ payment: { $exists: true } })}`);
  console.log(`  billings still present       : ${(await db.listCollections({ name: "billings" }).toArray()).length > 0}`);
  console.log(`  completed appointments       : ${await appointments.countDocuments({ isCompleted: true })}`);

  await mongoose.disconnect();
  console.log("\nMigration complete.\n");
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (chunk: string) => {
      process.stdin.pause();
      resolve(chunk);
    });
    process.stdin.resume();
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });