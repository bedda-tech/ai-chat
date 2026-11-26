/** Schedule math for scheduled tasks. dayOfWeek: -1 = daily, 0-6 = Sunday-Saturday. */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function localParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  return { day: WEEKDAYS.indexOf(weekday), hour };
}

/** Next instant strictly after `after` whose local time in `timezone` is `hour`:00 on a matching day. */
export function computeNextRun(
  after: Date,
  dayOfWeek: number,
  hour: number,
  timezone: string
): Date {
  // Start at the next top-of-hour, then step hourly (covers DST: a skipped hour is simply never matched that day).
  const start = new Date(after);
  start.setUTCMinutes(0, 0, 0);
  start.setTime(start.getTime() + 3_600_000);
  // Timezones with 30/45-minute offsets never land on local :00 in UTC top-of-hour; step in 15m to cover them.
  const cursor = new Date(start);
  for (let i = 0; i < 8 * 24 * 4 + 4; i++) {
    const c = new Date(cursor.getTime() + i * 900_000);
    if (c.getUTCMinutes() % 15 !== 0) {
      continue;
    }
    const localMinute = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        minute: "numeric",
      }).format(c)
    );
    if (localMinute !== 0) {
      continue;
    }
    const { day, hour: h } = localParts(c, timezone);
    if (h === hour && (dayOfWeek === -1 || day === dayOfWeek)) {
      return c;
    }
  }
  // Unreachable for valid input; fall back to a week out.
  return new Date(after.getTime() + 7 * 24 * 3_600_000);
}
