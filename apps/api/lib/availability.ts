/**
 * Canonical doctor availability.
 *
 * This module is the single source of truth for every date/time a doctor can be
 * booked for. Booking, rescheduling and any future surface must derive slots from
 * here so the same doctor always shows the same dates and times everywhere.
 *
 * Rules, in one place:
 *  - A day is offered only when the doctor's `schedule` has it `enabled`.
 *  - Slot times come from the day's `startTime`/`endTime`, stepping by the
 *    doctor's `slotDuration` (never a hardcoded 30 minutes).
 *  - Days listed in `blockedDates` are never offered.
 *  - Times already present in `slots_booked` are never offered.
 *  - Past times (relative to `APP_TIMEZONE`) are never offered.
 *  - Times are always `HH:mm` 24-hour strings, never locale-dependent output.
 *  - Dates are always `YYYY-MM-DD` keys, matching `appointment.slotDate`.
 */

export const DEFAULT_SLOT_DURATION = 30;
export const DEFAULT_AVAILABILITY_DAYS = 7;
export const MAX_AVAILABILITY_DAYS = 60;

export const SLOT_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const SLOT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Days are stored on the doctor document in lowercase weekday form. */
export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type DaySchedule = {
  enabled?: boolean;
  startTime?: string;
  endTime?: string;
};

export type DoctorSchedule = Partial<Record<WeekdayKey, DaySchedule>>;

export type SlotsBooked = Record<string, string[]>;

export type AvailabilityDoctor = {
  schedule?: DoctorSchedule | null;
  slotDuration?: number | null;
  blockedDates?: string[] | null;
  slots_booked?: SlotsBooked | null;
};

export type AvailableDay = {
  /** `YYYY-MM-DD` */
  date: string;
  /** Lowercase weekday key, e.g. `monday`. */
  weekday: WeekdayKey;
  /** `HH:mm` 24-hour times still bookable on this date. */
  slots: string[];
};

export type SlotValidation = {
  ok: boolean;
  message?: string;
};

/**
 * Single timezone used for "today" and for deciding which slots are in the past.
 * The doctor, the patient and the API must agree on this or the same slot will
 * look bookable in one place and already-past in another.
 */
export function appTimezone(): string {
  return process.env.APP_TIMEZONE || "Asia/Kolkata";
}

function partsInTimezone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  // Some ICU builds report midnight as hour "24"; normalise it to "00".
  const hour = parts.hour === "24" ? "00" : parts.hour;

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Current `YYYY-MM-DD` in the app timezone. */
export function todayDateKey(now: Date = new Date(), timeZone?: string): string {
  const { year, month, day } = partsInTimezone(now, timeZone || appTimezone());
  return `${year}-${month}-${day}`;
}

/** Current `HH:mm` in the app timezone. */
export function currentTimeKey(now: Date = new Date(), timeZone?: string): string {
  const { hour, minute } = partsInTimezone(now, timeZone || appTimezone());
  return `${hour}:${minute}`;
}

/**
 * Add whole days to a `YYYY-MM-DD` key.
 *
 * The date parts are re-anchored at UTC noon so the arithmetic can never be
 * shifted by a DST transition in the app timezone.
 */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return `${anchor.getUTCFullYear()}-${String(anchor.getUTCMonth() + 1).padStart(2, "0")}-${String(anchor.getUTCDate()).padStart(2, "0")}`;
}

/** Weekday key for a `YYYY-MM-DD` date. */
export function weekdayKeyForDateKey(dateKey: string): WeekdayKey {
  const [year, month, day] = dateKey.split("-").map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return WEEKDAY_KEYS[anchor.getUTCDay()];
}

export function isValidSlotTime(time: unknown): time is string {
  return typeof time === "string" && SLOT_TIME_PATTERN.test(time);
}

export function isValidSlotDate(date: unknown): date is string {
  if (typeof date !== "string" || !SLOT_DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function resolveSlotDuration(doctor: AvailabilityDoctor): number {
  const duration = Number(doctor?.slotDuration);
  if (!Number.isFinite(duration) || duration <= 0) return DEFAULT_SLOT_DURATION;
  return Math.floor(duration);
}

/** Every `HH:mm` slot the doctor's schedule defines for a weekday. */
export function slotsForWeekday(
  weekday: WeekdayKey,
  schedule: DoctorSchedule | null | undefined,
  slotDuration: number
): string[] {
  const day = schedule?.[weekday];
  if (!day?.enabled) return [];
  if (!isValidSlotTime(day.startTime) || !isValidSlotTime(day.endTime)) return [];

  const startMinutes = toMinutes(day.startTime);
  const endMinutes = toMinutes(day.endTime);
  if (endMinutes <= startMinutes) return [];

  const slots: string[] = [];
  for (let m = startMinutes; m < endMinutes; m += slotDuration) {
    slots.push(fromMinutes(m));
  }
  return slots;
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function normalizeBookedSlots(slotsBooked: SlotsBooked | null | undefined): SlotsBooked {
  const normalized: SlotsBooked = {};
  if (!slotsBooked || typeof slotsBooked !== "object") return normalized;
  for (const [date, times] of Object.entries(slotsBooked)) {
    if (Array.isArray(times)) normalized[date] = times.map((t) => String(t));
  }
  return normalized;
}

/**
 * The bookable days for a doctor, starting from `fromDate`.
 *
 * `ignoreSlot` lets rescheduling treat the appointment's own currently held slot
 * as free, so moving an appointment to its existing time is not rejected as a
 * conflict.
 */
export function buildAvailability(
  doctor: AvailabilityDoctor,
  options: {
    days?: number;
    fromDate?: string;
    now?: Date;
    timeZone?: string;
    ignoreSlot?: { date: string; time: string };
  } = {}
): AvailableDay[] {
  const {
    days = DEFAULT_AVAILABILITY_DAYS,
    fromDate,
    now = new Date(),
    timeZone,
    ignoreSlot,
  } = options;

  const timeZoneId = timeZone || appTimezone();
  const startDate = fromDate || todayDateKey(now, timeZoneId);
  const windowDays = Math.min(
    Math.max(1, Math.floor(Number(days) || DEFAULT_AVAILABILITY_DAYS)),
    MAX_AVAILABILITY_DAYS
  );

  const slotDuration = resolveSlotDuration(doctor);
  const booked = normalizeBookedSlots(doctor?.slots_booked);
  const blocked = new Set(
    (Array.isArray(doctor?.blockedDates) ? doctor.blockedDates : []).map(String)
  );
  const nowTime = currentTimeKey(now, timeZoneId);

  const result: AvailableDay[] = [];

  for (let offset = 0; offset < windowDays; offset += 1) {
    const date = addDaysToDateKey(startDate, offset);
    const weekday = weekdayKeyForDateKey(date);
    const slots = slotsForWeekday(weekday, doctor?.schedule, slotDuration);

    const bookedForDay = new Set(booked[date] || []);
    if (ignoreSlot?.date === date) bookedForDay.delete(ignoreSlot.time);

    const available = slots.filter((time) => {
      if (bookedForDay.has(time)) return false;
      if (offset === 0 && time <= nowTime) return false;
      return true;
    });

    // A blocked day is never offered, even if it still has schedule slots.
    if (blocked.has(date)) continue;

    result.push({ date, weekday, slots: available });
  }

  return result;
}

/** Flatten availability into the exact `date`/`time` pairs a client may book. */
export function listBookableSlots(
  doctor: AvailabilityDoctor,
  options: Parameters<typeof buildAvailability>[1] = {}
): Array<{ date: string; time: string }> {
  return buildAvailability(doctor, options).flatMap((day) =>
    day.slots.map((time) => ({ date: day.date, time }))
  );
}

/**
 * Server-side gate for booking and rescheduling.
 *
 * The client is never trusted: a request for a time the doctor's schedule does
 * not contain, on a blocked or past date, or for an already-booked slot is
 * rejected here even if the UI offered it.
 */
export function validateSlot(
  doctor: AvailabilityDoctor,
  slotDate: unknown,
  slotTime: unknown,
  options: Parameters<typeof buildAvailability>[1] = {}
): SlotValidation {
  if (!isValidSlotDate(slotDate)) {
    return { ok: false, message: "Invalid appointment date" };
  }
  if (!isValidSlotTime(slotTime)) {
    return { ok: false, message: "Invalid appointment time" };
  }

  const blocked = Array.isArray(doctor?.blockedDates) ? doctor.blockedDates.map(String) : [];
  if (blocked.includes(slotDate)) {
    return { ok: false, message: "Doctor is not available on this date" };
  }

  const searchDate = options.fromDate || slotDate;
  const availability = buildAvailability(doctor, { ...options, fromDate: searchDate });
  const day = availability.find((d) => d.date === slotDate);

  if (!day) {
    return { ok: false, message: "Doctor is not available on this date" };
  }
  if (!day.slots.includes(slotTime)) {
    return { ok: false, message: "Selected time slot is not available" };
  }

  return { ok: true };
}

/** Milliseconds from now until `time` on `date`; used for booking lead time. */
export function minutesUntil(
  date: string,
  time: string,
  now: Date = new Date(),
  timeZone?: string
): number {
  const timeZoneId = timeZone || appTimezone();
  const today = todayDateKey(now, timeZoneId);
  const nowTime = currentTimeKey(now, timeZoneId);

  const dayDelta =
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  const timeDelta = toMinutes(time) - toMinutes(nowTime);
  return dayDelta * 1440 + timeDelta;
}

/** Test helper: advance a clock by whole minutes. */
export function shiftMinutes(now: Date, minutes: number): Date {
  return new Date(now.getTime() + minutes * 60_000);
}
