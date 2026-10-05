import assert from "node:assert/strict";
import {
  addDaysToDateKey,
  buildAvailability,
  currentTimeKey,
  isValidSlotDate,
  isValidSlotTime,
  listBookableSlots,
  resolveSlotDuration,
  slotsForWeekday,
  todayDateKey,
  validateSlot,
  weekdayKeyForDateKey,
} from "../lib/availability";

const TZ = "Asia/Kolkata";

// 2026-01-05 is a Monday.
const MONDAY = "2026-01-05";
const TUESDAY = "2026-01-06";
const SUNDAY = "2026-01-11";

// Asia/Kolkata is UTC+05:30, so a given Kolkata wall-clock time maps to an
// absolute instant by subtracting 330 minutes.
const KOLKATA_OFFSET_MINUTES = 330;

function at(hour: number, minute: number, day = 5) {
  const utcMinutes = hour * 60 + minute - KOLKATA_OFFSET_MINUTES;
  return new Date(Date.UTC(2026, 0, day, 0, 0, 0) + utcMinutes * 60_000);
}

function doctor(overrides: Record<string, unknown> = {}) {
  return {
    schedule: {
      monday: { enabled: true, startTime: "09:00", endTime: "11:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "10:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    },
    slotDuration: 30,
    blockedDates: [] as string[],
    slots_booked: {} as Record<string, string[]>,
    ...overrides,
  };
}

const tests: Array<[string, () => void]> = [];
const test = (name: string, fn: () => void) => tests.push([name, fn]);

test("validates slot time and date formats strictly", () => {
  assert.equal(isValidSlotTime("09:00"), true);
  assert.equal(isValidSlotTime("9:00"), false);
  assert.equal(isValidSlotTime("24:00"), false);
  assert.equal(isValidSlotTime("09:60"), false);
  assert.equal(isValidSlotTime("09:00 AM"), false);
  assert.equal(isValidSlotDate("2026-01-05"), true);
  assert.equal(isValidSlotDate("2026-02-30"), false);
  assert.equal(isValidSlotDate("2026-1-5"), false);
});

test("derives weekday keys without timezone drift", () => {
  assert.equal(weekdayKeyForDateKey(MONDAY), "monday");
  assert.equal(weekdayKeyForDateKey(SUNDAY), "sunday");
});

test("adds days across month and year boundaries", () => {
  assert.equal(addDaysToDateKey("2026-01-31", 1), "2026-02-01");
  assert.equal(addDaysToDateKey("2026-12-31", 1), "2027-01-01");
  assert.equal(addDaysToDateKey(MONDAY, -1), "2026-01-04");
});

test("expands a schedule window using the doctor's own slotDuration", () => {
  const d = doctor({ slotDuration: 45 });
  assert.deepEqual(slotsForWeekday("monday", d.schedule, 45), [
    "09:00",
    "09:45",
    "10:30",
  ]);
});

test("returns no slots for a disabled day", () => {
  assert.deepEqual(slotsForWeekday("sunday", doctor().schedule, 30), []);
});

test("respects a non-default slotDuration instead of assuming 30", () => {
  assert.equal(resolveSlotDuration({ slotDuration: 20 }), 20);
  assert.equal(resolveSlotDuration({ slotDuration: 0 }), 30);
  assert.equal(resolveSlotDuration({}), 30);
});

test("hides past times on the current day only", () => {
  const now = at(9, 30); // 09:30 Kolkata on Monday
  const days = buildAvailability(doctor(), { fromDate: MONDAY, now, timeZone: TZ });
  assert.deepEqual(days[0].slots, ["10:00", "10:30"]);
  assert.deepEqual(days[1].slots, ["09:00", "09:30"]);
});

test("omits blocked dates entirely", () => {
  const days = buildAvailability(doctor({ blockedDates: [TUESDAY] }), {
    fromDate: MONDAY,
    now: at(0, 0),
    timeZone: TZ,
  });
  assert.equal(
    days.some((d) => d.date === TUESDAY),
    false
  );
});

test("omits already-booked times", () => {
  const d = doctor({ slots_booked: { [MONDAY]: ["09:30"] } });
  const days = buildAvailability(d, { fromDate: MONDAY, now: at(0, 0), timeZone: TZ });
  assert.deepEqual(days[0].slots, ["09:00", "10:00", "10:30"]);
});

test("re-frees a slot the caller ignores, for rescheduling", () => {
  const d = doctor({ slots_booked: { [MONDAY]: ["09:00", "09:30"] } });
  const days = buildAvailability(d, {
    fromDate: MONDAY,
    now: at(0, 0),
    timeZone: TZ,
    ignoreSlot: { date: MONDAY, time: "09:00" },
  });
  assert.ok(days[0].slots.includes("09:00"));
});

test("includes a zero-slot day so the UI can still render the week", () => {
  const days = buildAvailability(
    doctor({ slots_booked: { [MONDAY]: ["09:00", "09:30", "10:00", "10:30"] } }),
    { fromDate: MONDAY, now: at(0, 0), timeZone: TZ }
  );
  assert.equal(days[0].date, MONDAY);
  assert.deepEqual(days[0].slots, []);
});

test("flattens to bookable date/time pairs", () => {
  const pairs = listBookableSlots(doctor(), {
    fromDate: MONDAY,
    now: at(0, 0),
    timeZone: TZ,
    days: 2,
  });
  assert.deepEqual(pairs, [
    { date: MONDAY, time: "09:00" },
    { date: MONDAY, time: "09:30" },
    { date: MONDAY, time: "10:00" },
    { date: MONDAY, time: "10:30" },
    { date: TUESDAY, time: "09:00" },
    { date: TUESDAY, time: "09:30" },
  ]);
});

test("validates a legitimate slot", () => {
  assert.deepEqual(
    validateSlot(doctor(), MONDAY, "09:00", { now: at(0, 0), timeZone: TZ }),
    { ok: true }
  );
});

test("rejects times outside the doctor's window", () => {
  const r = validateSlot(doctor(), MONDAY, "18:00", { now: at(0, 0), timeZone: TZ });
  assert.equal(r.ok, false);
});

test("rejects a day the doctor does not work", () => {
  assert.equal(
    validateSlot(doctor(), SUNDAY, "10:00", { now: at(0, 0), timeZone: TZ }).ok,
    false
  );
});

test("rejects a blocked date", () => {
  assert.equal(
    validateSlot(doctor({ blockedDates: [TUESDAY] }), TUESDAY, "09:00", {
      now: at(0, 0),
      timeZone: TZ,
    }).ok,
    false
  );
});

test("rejects an already-booked time", () => {
  const d = doctor({ slots_booked: { [MONDAY]: ["09:00"] } });
  assert.equal(
    validateSlot(d, MONDAY, "09:00", { now: at(0, 0), timeZone: TZ }).ok,
    false
  );
});

test("rejects malformed and out-of-range input", () => {
  const now = at(0, 0);
  assert.equal(validateSlot(doctor(), "not-a-date", "09:00", { now }).ok, false);
  assert.equal(validateSlot(doctor(), MONDAY, "9am", { now }).ok, false);
  assert.equal(validateSlot(doctor(), MONDAY, "99:99", { now }).ok, false);
});

test("rejects a past time on the current day", () => {
  const r = validateSlot(doctor(), MONDAY, "09:00", { now: at(9, 30), timeZone: TZ });
  assert.equal(r.ok, false);
});

test("booking and rescheduling derive identical slots for the same doctor", () => {
  const d = doctor({ slots_booked: { [MONDAY]: ["09:30"] } });
  const opts = { fromDate: MONDAY, now: at(0, 0), timeZone: TZ, days: 7 };
  const booking = buildAvailability(d, opts);
  const rescheduling = buildAvailability(d, {
    ...opts,
    ignoreSlot: { date: MONDAY, time: "10:00" },
  });
  // Ignoring a slot that is not booked must not change the derived set.
  assert.deepEqual(booking, rescheduling);
});

test("today is computed in the app timezone", () => {
  // 2026-01-05 18:30 UTC is already 2026-01-06 00:00 in Kolkata.
  assert.equal(todayDateKey(new Date("2026-01-05T18:30:00Z"), TZ), "2026-01-06");
  assert.equal(todayDateKey(new Date("2026-01-05T18:30:00Z"), "UTC"), "2026-01-05");
  assert.equal(currentTimeKey(new Date("2026-01-05T18:30:00Z"), TZ), "00:00");
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${(error as Error).message.split("\n")[0]}`);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed === 0 ? 0 : 1);
