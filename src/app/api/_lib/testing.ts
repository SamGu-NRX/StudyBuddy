/**
 * Contract-test helpers for API route handlers.
 *
 * Route tests mock the two side-effecting modules every handler depends on:
 *   - "@/../auth"  (NextAuth session lookup)
 *   - "@/lib/db"   (Prisma client)
 * and then invoke the exported POST/GET functions with a NextRequest built by
 * makeJsonRequest. See src/app/api/_lib/http.test.ts for the working pattern.
 */
import { NextRequest } from "next/server";

/** Builds a POST request with a JSON body, matching how the frontend calls these routes. */
export function makeJsonRequest(
  body: unknown,
  url = "http://localhost:3000/api/test",
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Builds a POST request whose body is not valid JSON. */
export function makeMalformedJsonRequest(
  rawBody = "{not json",
  url = "http://localhost:3000/api/test",
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rawBody,
  });
}

/** Builds a POST request with no body at all. */
export function makeBodylessRequest(
  url = "http://localhost:3000/api/test",
): NextRequest {
  return new NextRequest(url, { method: "POST" });
}

/**
 * Builds a NextAuth session-shaped object for tests.
 * Pass null to simulate an unauthenticated request.
 */
export function makeSession(userId: string | null) {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      role: "STUDENT",
    },
    expires: "2999-01-01T00:00:00.000Z",
  };
}

/** Reads a response body as unknown JSON (callers assert on its shape). */
export async function jsonOf(response: Response): Promise<unknown> {
  return (await response.json()) as unknown;
}
