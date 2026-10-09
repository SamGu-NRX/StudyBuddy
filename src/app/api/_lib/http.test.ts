/**
 * Contract tests for the shared HTTP helpers, and the reference example of
 * the mock plumbing that route contract tests must use.
 */
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  apiError,
  formatZodError,
  isPrismaKnownError,
  parseJsonBody,
  requireUserId,
} from "./http";
import {
  makeBodylessRequest,
  makeJsonRequest,
  makeMalformedJsonRequest,
  makeSession,
} from "./testing";

// --- mock plumbing ---------------------------------------------------------
// Route files import exactly these two specifiers, so route tests must mock
// exactly these two specifiers. This suite proves the aliases resolve.
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {},
}));
vi.mock("@/../auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ db: mocks.db }));

import { auth as mockedAuth } from "@/../auth";
import { db as mockedDb } from "@/lib/db";

describe("mock plumbing", () => {
  it("intercepts the exact module specifiers the route files use", async () => {
    expect(mockedAuth).toBe(mocks.auth);
    expect(mockedDb).toBe(mocks.db);

    const session = makeSession("user-1");
    mocks.auth.mockResolvedValue(session);
    await expect(mocks.auth()).resolves.toBe(session);
    mocks.auth.mockReset();
  });
});

// --- parseJsonBody ---------------------------------------------------------

const NumberSchema = z.object({ n: z.number() });

describe("parseJsonBody", () => {
  it("returns typed data for a valid body", async () => {
    const result = await parseJsonBody(makeJsonRequest({ n: 1 }), NumberSchema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ n: 1 });
  });

  it("rejects malformed JSON with a 400 and a specific message", async () => {
    const result = await parseJsonBody(
      makeMalformedJsonRequest(),
      NumberSchema,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "Invalid JSON body",
      });
    }
  });

  it("rejects a missing body with a 400", async () => {
    const result = await parseJsonBody(makeBodylessRequest(), NumberSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it("rejects schema violations naming the offending field", async () => {
    const result = await parseJsonBody(
      makeJsonRequest({ n: "not a number" }),
      NumberSchema,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "Invalid request body — n: Expected number, received string",
      });
    }
  });

  it("formats nested paths as dot notation", () => {
    const schema = z.object({
      a: z.object({ b: z.array(z.object({ c: z.string() })) }),
    });
    const error = schema.safeParse({ a: { b: [{ c: 1 }] } });
    if (error.success) throw new Error("expected parse failure");
    expect(formatZodError(error.error)).toBe("a.b.0.c: Expected string, received number");
  });
});

// --- apiError --------------------------------------------------------------

describe("apiError", () => {
  it("produces the { error } wire shape with the given status", async () => {
    const response = apiError(401, "Unauthorized");
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});

// --- requireUserId ---------------------------------------------------------

describe("requireUserId", () => {
  it("returns the id for a well-formed session", () => {
    expect(requireUserId(makeSession("user-1"))).toBe("user-1");
  });

  it("returns null for a missing session or missing id", () => {
    expect(requireUserId(null)).toBeNull();
    expect(requireUserId(undefined)).toBeNull();
    expect(requireUserId(makeSession(null))).toBeNull();
    expect(requireUserId({})).toBeNull();
    expect(requireUserId({ user: { id: 42 } })).toBeNull();
  });
});

// --- isPrismaKnownError ----------------------------------------------------

describe("isPrismaKnownError", () => {
  it("matches by error code without importing @prisma/client", () => {
    expect(isPrismaKnownError({ code: "P2025" }, "P2025")).toBe(true);
    expect(isPrismaKnownError({ code: "P2002" }, "P2025")).toBe(false);
    expect(isPrismaKnownError(null, "P2025")).toBe(false);
    expect(isPrismaKnownError("P2025", "P2025")).toBe(false);
    expect(isPrismaKnownError(new Error("P2025"), "P2025")).toBe(false);
  });
});
