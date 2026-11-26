import assert from "node:assert/strict";
import { computeNextRun, isValidTimezone } from "./next-run";

// 2026-11-26 is a Thursday. Next Monday 9:00 UTC is 2026-11-30T09:00Z.
assert.equal(
  computeNextRun(new Date("2026-11-26T12:00:00Z"), 1, 9, "UTC").toISOString(),
  "2026-11-30T09:00:00.000Z"
);
// Daily, already past today's hour -> tomorrow.
assert.equal(
  computeNextRun(new Date("2026-11-26T12:00:00Z"), -1, 9, "UTC").toISOString(),
  "2026-11-27T09:00:00.000Z"
);
// Strictly after: exactly at the run time rolls to the next occurrence.
assert.equal(
  computeNextRun(new Date("2026-11-30T09:00:00Z"), 1, 9, "UTC").toISOString(),
  "2026-12-07T09:00:00.000Z"
);
// Timezone: Monday 9:00 America/New_York (EST, UTC-5) = 14:00Z.
assert.equal(
  computeNextRun(
    new Date("2026-11-26T12:00:00Z"),
    1,
    9,
    "America/New_York"
  ).toISOString(),
  "2026-11-30T14:00:00.000Z"
);
assert.equal(isValidTimezone("Europe/Rome"), true);
assert.equal(isValidTimezone("Nope/Zone"), false);
console.log("next-run tests passed");
