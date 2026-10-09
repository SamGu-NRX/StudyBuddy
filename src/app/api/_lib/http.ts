/**
 * Shared HTTP contract helpers for API route handlers.
 *
 * Every route under src/app/api must validate its inputs through these helpers
 * so that misuse fails loudly at the boundary (4xx with a specific message)
 * instead of surfacing as an unhandled 500 deep inside Prisma or business code.
 */
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

/** Status codes a route handler in this app is allowed to return. */
export type ApiErrorStatus = 400 | 401 | 403 | 404 | 500;

/**
 * Builds the error body used by every failure path in src/app/api.
 * Wire shape is always `{ error: string }`.
 */
export function apiError(
  status: ApiErrorStatus,
  message: string,
): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}

/** Renders a ZodError as a single deterministic, specific message. */
export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path =
        issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

export type ParseBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse<{ error: string }> };

/**
 * Parses and validates a JSON request body against a zod schema.
 *
 * Returns a discriminated result so handlers cannot accidentally use
 * unvalidated data: on failure the second branch carries a ready-to-return
 * 400 response whose message names the offending field and the reason.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<ParseBodyResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError(400, "Invalid JSON body") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: apiError(
        400,
        `Invalid request body — ${formatZodError(result.error)}`,
      ),
    };
  }
  return { ok: true, data: result.data };
}

/**
 * Extracts the authenticated user's id from a NextAuth session.
 *
 * `session.user.id` is optional in the app's type augmentation, so callers
 * must narrow it explicitly before using it as a Prisma foreign key. Returns
 * null for a missing session, a missing user, or a missing/empty id.
 */
export function requireUserId(
  session: unknown,
): string | null {
  if (typeof session !== "object" || session === null) return null;
  const user = (session as { user?: unknown }).user;
  if (typeof user !== "object" || user === null) return null;
  const id = (user as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) return null;
  return id;
}

/**
 * Structural check for a PrismaClientKnownRequestError without importing
 * from "@prisma/client" (the generated client is incomplete in this repo,
 * e.g. it does not re-export UserRole).
 */
export function isPrismaKnownError(error: unknown, code: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: unknown };
  return typeof candidate.code === "string" && candidate.code === code;
}
