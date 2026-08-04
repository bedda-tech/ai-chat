import assert from "node:assert";

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function main() {
  process.env.WORKOS_CLIENT_ID = "client_test_id";
  const { getWorkOSAuthorizationUrl } = await import("./workos");

  await test("builds the base authorize URL with client_id, redirect_uri, response_type", () => {
    const url = getWorkOSAuthorizationUrl({
      redirectUri: "https://bedda.ai/api/auth/workos/callback",
    });
    const parsed = new URL(url);
    assert.strictEqual(
      parsed.origin + parsed.pathname,
      "https://api.workos.com/user_management/authorize"
    );
    assert.strictEqual(
      parsed.searchParams.get("client_id"),
      "client_test_id"
    );
    assert.strictEqual(
      parsed.searchParams.get("redirect_uri"),
      "https://bedda.ai/api/auth/workos/callback"
    );
    assert.strictEqual(parsed.searchParams.get("response_type"), "code");
    assert.strictEqual(parsed.searchParams.get("organization_id"), null);
    assert.strictEqual(parsed.searchParams.get("connection"), null);
    assert.strictEqual(parsed.searchParams.get("state"), null);
  });

  await test("includes organization_id when provided", () => {
    const url = getWorkOSAuthorizationUrl({
      organizationId: "org_123",
      redirectUri: "https://bedda.ai/api/auth/workos/callback",
    });
    assert.strictEqual(
      new URL(url).searchParams.get("organization_id"),
      "org_123"
    );
  });

  await test("includes connection when connectionId is provided", () => {
    const url = getWorkOSAuthorizationUrl({
      connectionId: "conn_456",
      redirectUri: "https://bedda.ai/api/auth/workos/callback",
    });
    assert.strictEqual(new URL(url).searchParams.get("connection"), "conn_456");
  });

  await test("includes state when provided", () => {
    const url = getWorkOSAuthorizationUrl({
      redirectUri: "https://bedda.ai/api/auth/workos/callback",
      state: "csrf-token-abc",
    });
    assert.strictEqual(
      new URL(url).searchParams.get("state"),
      "csrf-token-abc"
    );
  });

  await test("includes all optional params together and omits none of them", () => {
    const url = getWorkOSAuthorizationUrl({
      organizationId: "org_123",
      connectionId: "conn_456",
      redirectUri: "https://bedda.ai/api/auth/workos/callback",
      state: "csrf-token-abc",
    });
    const parsed = new URL(url);
    assert.strictEqual(parsed.searchParams.get("organization_id"), "org_123");
    assert.strictEqual(parsed.searchParams.get("connection"), "conn_456");
    assert.strictEqual(parsed.searchParams.get("state"), "csrf-token-abc");
  });

  if (process.exitCode === 1) {
    console.error("Some tests failed");
  } else {
    console.log("All tests passed");
  }
}

main();
