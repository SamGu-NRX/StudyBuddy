/**
 * Infrastructure smoke test: proves the vitest setup, the `@/*` alias
 * resolution (including the root-level `@/index` fallback), and the bench
 * harness all work before any perf/robustness changes are layered on.
 */
import { describe, expect, it } from "vitest";
import { cn, chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { measureCase, registerCase, machineLoad } from "@bench/harness";

describe("harness infra", () => {
  it("resolves @/ imports into src/lib", () => {
    expect(typeof cn).toBe("function");
    expect(toPusherKey("user:42:chat")).toBe("user__42__chat");
    expect(chatHrefConstructor("bbb", "aaa")).toBe("aaa--bbb");
  });

  it("resolves the root-level @/index fallback used by middleware", async () => {
    const index = await import("@/index");
    expect(Array.isArray(index.publicRoutes)).toBe(true);
    expect(index.apiAuthPrefix).toBe("/api/auth");
  });

  it("measures and summarizes timings", async () => {
    const seen: string[] = [];
    const c = {
      name: "smoke/noop",
      group: "smoke",
      unit: "ops" as const,
      warmup: 5,
      iterations: 20,
      run: () => {
        seen.push("x");
      },
    };
    registerCase(c);
    const r = await measureCase(c);
    expect(r.samples).toBe(20);
    expect(r.median).toBeGreaterThanOrEqual(0);
    expect(seen.length).toBe(25); // 5 warmup + 20 measured
    expect(machineLoad().cores).toBeGreaterThan(0);
  });
});

describe("cn golden behavior (unchanged by perf work)", () => {
  it("collapses conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("p-2", false && "p-4", "px-6")).toBe("p-2 px-6");
  });
});
