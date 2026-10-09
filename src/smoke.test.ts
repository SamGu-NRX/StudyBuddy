import { describe, it, expect } from "vitest";

// Canary for the test stack itself: proves the '@' alias, the '@/..' root
// alias used across the app (e.g. import { auth } from "@/../auth"), and
// module resolution of the app's own code all work under Vitest.
import authConfig from "@/../auth.config";
import { LoginSchema, RegisterSchema } from "@/schema";

describe("test-stack canary", () => {
  it("resolves the '@/..' root alias and loads the real auth config", () => {
    expect(authConfig).toBeTruthy();
    expect(Array.isArray(authConfig.providers)).toBe(true);
    expect(authConfig.providers.length).toBeGreaterThanOrEqual(4);
  });

  it("resolves '@/schema' and the schemas parse valid input", () => {
    expect(
      LoginSchema.safeParse({ email: "a@b.com", password: "nospaces" }).success
    ).toBe(true);
    expect(
      RegisterSchema.safeParse({
        email: "a@b.com",
        password: "nospaces123",
        firstName: "Ada",
        lastName: "Lovelace",
      }).success
    ).toBe(true);
  });

  it("rejects invalid login input through the real schema", () => {
    expect(LoginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(
      false
    );
  });
});
