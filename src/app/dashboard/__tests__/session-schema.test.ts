/**
 * Contract tests for `src/app/dashboard/session-schema.ts`.
 *
 * Covers the dashboard's runtime trust boundary: valid, boundary, and invalid
 * session values, asserting the exact error behavior (specific messages, one
 * per violated field).
 */
import * as assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DASHBOARD_USER_ROLES,
  DashboardSessionValidationError,
  assertDashboardSession,
  dashboardSessionSchema,
  validateDashboardSession,
} from "../session-schema";

/** A session that satisfies the full contract. */
function validSession(overrides: {
  user?: Record<string, unknown>;
  expires?: string;
} = {}): Record<string, unknown> {
  return {
    expires: overrides.expires ?? "2024-01-01T00:00:00.000Z",
    user: {
      id: "user_1",
      name: "Sam Gu",
      email: "sam@example.com",
      role: "STUDENT",
      ...(overrides.user ?? {}),
    },
  };
}

describe("validateDashboardSession", () => {
  it("accepts a fully populated session", () => {
    const session = validSession();
    const result = validateDashboardSession(session);
    assert.deepEqual(result, { ok: true, session });
  });

  it("accepts a session whose optional fields are absent (role and id are set only when the JWT carries them)", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "sam@example.com" },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.session.user.role, undefined);
      assert.equal(result.session.user.id, undefined);
    }
  });

  it("accepts a null name (OAuth providers may omit it)", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { name: null, email: "sam@example.com" },
    });
    assert.equal(result.ok, true);
  });

  it("accepts unknown next-auth fields (passthrough)", () => {
    const result = validateDashboardSession({
      ...validSession(),
      someFutureField: { nested: true },
    });
    assert.equal(result.ok, true);
  });

  it("rejects a missing user with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, ["session.user must be object but it is missing"]);
    }
  });

  it("rejects a missing expires with a specific message", () => {
    const result = validateDashboardSession({
      user: { email: "sam@example.com" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, ["session.expires must be string but it is missing"]);
    }
  });

  it("rejects a non-object session", () => {
    for (const bad of [null, undefined, 42, "session", []]) {
      const result = validateDashboardSession(bad);
      assert.equal(result.ok, false, `expected rejection for ${JSON.stringify(bad)}`);
      if (!result.ok) {
        assert.ok(
          result.errors.every((message) => message.startsWith("session")),
          `every message must address the session, got: ${result.errors.join("; ")}`,
        );
      }
    }
  });

  it("rejects a missing email with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { name: "Sam" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        "session.user.email must be string but it is missing",
      ]);
    }
  });

  it("rejects a non-string email with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: 42 },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        "session.user.email must be string but received 42",
      ]);
    }
  });

  it("rejects a malformed email with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "not-an-email" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        'session.user.email must be a valid email address (received "not-an-email")',
      ]);
    }
  });

  it("rejects an unknown role with a specific message naming the allowed values", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "sam@example.com", role: "GUEST" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        'session.user.role must be one of STUDENT, TEACHER, ADMIN (received "GUEST")',
      ]);
    }
  });

  it("rejects a non-string id with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "sam@example.com", id: 7 },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        "session.user.id must be string but received 7",
      ]);
    }
  });

  it("rejects an empty-string id with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "sam@example.com", id: "" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        'session.user.id must be a non-empty string (received "")',
      ]);
    }
  });

  it("rejects a numeric name with a specific message", () => {
    const result = validateDashboardSession({
      expires: "2024-01-01T00:00:00.000Z",
      user: { email: "sam@example.com", name: 42 },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(result.errors, [
        "session.user.name must be string but received 42",
      ]);
    }
  });

  it("reports every violated field at once", () => {
    const result = validateDashboardSession({
      user: { email: "nope", role: "GUEST" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errors.length, 3);
      assert.ok(result.errors[0].startsWith("session.expires"));
      assert.ok(result.errors[1].startsWith("session.user.email"));
      assert.ok(result.errors[2].startsWith("session.user.role"));
    }
  });
});

describe("assertDashboardSession", () => {
  it("returns the session when the contract holds", () => {
    const session = validSession();
    assert.deepEqual(assertDashboardSession(session), session);
  });

  it("throws DashboardSessionValidationError with joined specific messages", () => {
    assert.throws(
      () =>
        assertDashboardSession({
          expires: "2024-01-01T00:00:00.000Z",
          user: { email: "sam@example.com", role: "SUPERUSER" },
        }),
      (error: unknown) => {
        assert.ok(error instanceof DashboardSessionValidationError);
        const validationError = error as DashboardSessionValidationError;
        assert.equal(validationError.name, "DashboardSessionValidationError");
        assert.deepEqual(validationError.issues, [
          'session.user.role must be one of STUDENT, TEACHER, ADMIN (received "SUPERUSER")',
        ]);
        assert.match(
          validationError.message,
          /^Invalid dashboard session: session\.user\.role must be one of/,
        );
        return true;
      },
    );
  });

  it("exposes every field violation on the thrown error", () => {
    try {
      assertDashboardSession({ user: {} });
      assert.fail("expected DashboardSessionValidationError");
    } catch (error) {
      assert.ok(error instanceof DashboardSessionValidationError);
      const validationError = error as DashboardSessionValidationError;
      assert.equal(validationError.issues.length, 2);
      assert.ok(validationError.issues[0].startsWith("session.expires"));
      assert.ok(validationError.issues[1].startsWith("session.user.email"));
    }
  });
});

describe("schema exports", () => {
  it("declares exactly the roles from prisma/schema.prisma", () => {
    assert.deepEqual([...DASHBOARD_USER_ROLES], ["STUDENT", "TEACHER", "ADMIN"]);
  });

  it("accepts the same values through the raw zod schema", () => {
    const parsed = dashboardSessionSchema.safeParse(validSession());
    assert.equal(parsed.success, true);
  });

  it("rejects a role value that is not in the enum through the raw zod schema", () => {
    const parsed = dashboardSessionSchema.safeParse({
      ...validSession(),
      user: { email: "sam@example.com", role: "ROOT" },
    });
    assert.equal(parsed.success, false);
  });
});
