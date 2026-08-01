/**
 * Unit tests for getMessageByErrorCode.
 * Run with: npx tsx lib/errors.test.ts
 */
import assert from "node:assert/strict";
import { getMessageByErrorCode } from "./errors";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

console.log("getMessageByErrorCode");

test("short-circuits any error type on the database surface", () => {
  const message = "An error occurred while executing a database query.";
  assert.equal(getMessageByErrorCode("bad_request:database"), message);
  assert.equal(getMessageByErrorCode("rate_limit:database"), message);
  assert.equal(getMessageByErrorCode("offline:database"), message);
});

test("returns the specific message for each known error code", () => {
  assert.equal(
    getMessageByErrorCode("bad_request:api"),
    "The request couldn't be processed. Please check your input and try again."
  );
  assert.match(
    getMessageByErrorCode("bad_request:activate_gateway"),
    /AI Gateway requires a valid credit card/
  );
  assert.equal(
    getMessageByErrorCode("unauthorized:auth"),
    "You need to sign in before continuing."
  );
  assert.equal(
    getMessageByErrorCode("forbidden:auth"),
    "Your account does not have access to this feature."
  );
  assert.match(
    getMessageByErrorCode("rate_limit:chat"),
    /exceeded your maximum number of messages/
  );
  assert.match(
    getMessageByErrorCode("not_found:chat"),
    /requested chat was not found/
  );
  assert.match(
    getMessageByErrorCode("forbidden:chat"),
    /belongs to another user/
  );
  assert.match(
    getMessageByErrorCode("unauthorized:chat"),
    /need to sign in to view this chat/
  );
  assert.match(getMessageByErrorCode("offline:chat"), /internet connection/);
  assert.match(
    getMessageByErrorCode("not_found:document"),
    /requested document was not found/
  );
  assert.match(
    getMessageByErrorCode("forbidden:document"),
    /document belongs to another user/
  );
  assert.match(
    getMessageByErrorCode("unauthorized:document"),
    /need to sign in to view this document/
  );
  assert.match(
    getMessageByErrorCode("bad_request:document"),
    /create or update the document was invalid/
  );
});

test("falls back to a generic message for unmapped error codes", () => {
  const generic = "Something went wrong. Please try again later.";
  assert.equal(getMessageByErrorCode("rate_limit:vote"), generic);
  assert.equal(getMessageByErrorCode("bad_request:suggestions"), generic);
  assert.equal(getMessageByErrorCode("not_found:history"), generic);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
