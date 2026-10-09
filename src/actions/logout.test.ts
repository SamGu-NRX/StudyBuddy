import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/../auth", async () => {
  const { authRouteModuleMock } = await import("./__tests__/helpers");
  return authRouteModuleMock;
});

import { resetActionMocks, signOutMock } from "./__tests__/helpers";
import { logout } from "./logout";

/**
 * Contract tests for the `logout` action.
 *
 * Contract:
 * - Signature: `logout(): Promise<void>` — no arguments, never returns a value.
 * - Delegates to NextAuth's signOut() exactly once, with no arguments.
 * - Expected failures are not part of this action's contract: if signOut
 *   rejects, the rejection propagates to the caller instead of being
 *   swallowed.
 */
describe("logout action", () => {
  beforeEach(() => {
    resetActionMocks();
  });

  it("delegates to signOut with no arguments and resolves void", async () => {
    signOutMock.mockResolvedValueOnce(undefined);

    await expect(logout()).resolves.toBeUndefined();
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledWith();
  });

  it("propagates a signOut failure instead of swallowing it", async () => {
    signOutMock.mockRejectedValueOnce(new Error("session destroy failed"));

    await expect(logout()).rejects.toThrow("session destroy failed");
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
