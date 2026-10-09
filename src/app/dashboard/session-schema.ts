/**
 * Runtime contract for the session the dashboard routes consume.
 *
 * `src/app/dashboard/` pages render behind an authenticated session provided by
 * next-auth. The `session` callback in `auth.ts` only assigns
 * `session.user.role` **when the JWT carries one** (`if (token.role)`), and
 * `session.user.id` only when the JWT has a `sub`. Any consumer that assumes
 * `role: UserRole` is always present is relying on an unchecked promise.
 *
 * This module is the trust boundary: every dashboard route validates the
 * session it receives through `assertDashboardSession` (fail loudly) or
 * `validateDashboardSession` (structured result) instead of trusting the cast.
 *
 * Validation is intentionally field-specific: every failure message names the
 * field, the expectation, and the received value.
 */
import { z } from "zod";

/** Roles defined by the `UserRole` enum in `prisma/schema.prisma`. */
export const DASHBOARD_USER_ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;

export type DashboardUserRole = (typeof DASHBOARD_USER_ROLES)[number];

/**
 * The user object the dashboard may rely on.
 *
 * - `email` is required: `auth.ts` resolves the user by email on sign-in, so a
 *   session without an email can never reach an authenticated dashboard route.
 * - `name` may be null (OAuth providers do not always return a name).
 * - `id` is only assigned when the JWT has a `sub` claim, so it is optional.
 * - `role` is only assigned when the JWT carries one, so it is optional — but
 *   when present it must be a valid `UserRole` value.
 */
export const dashboardSessionUserSchema = z
  .object({
    id: z
      .string({ invalid_type_error: "session.user.id must be a string" })
      .min(1, "session.user.id must be a non-empty string")
      .optional(),
    name: z
      .string({ invalid_type_error: "session.user.name must be a string" })
      .nullable()
      .optional(),
    email: z
      .string({ invalid_type_error: "session.user.email must be a string" })
      .email("session.user.email must be a valid email address"),
    role: z
      .enum(DASHBOARD_USER_ROLES, {
        errorMap: () =>
          new Error(
            `session.user.role must be one of ${DASHBOARD_USER_ROLES.join(", ")}`,
          ),
      })
      .optional(),
  })
  .passthrough();

export type DashboardSessionUser = z.infer<typeof dashboardSessionUserSchema>;

/** Shape of the next-auth `Session` object the dashboard routes depend on. */
export const dashboardSessionSchema = z
  .object({
    expires: z.string({
      invalid_type_error: "session.expires must be a string",
      required_error: "session.expires is required",
    }),
    user: dashboardSessionUserSchema,
  })
  .passthrough();

export type DashboardSession = z.infer<typeof dashboardSessionSchema>;

/** Structured validation result — never throws. */
export type DashboardSessionResult =
  | { ok: true; session: DashboardSession }
  | { ok: false; errors: string[] };

const FIELD_LABELS: Record<string, string> = {
  "": "session",
  user: "session.user",
  "user.id": "session.user.id",
  "user.name": "session.user.name",
  "user.email": "session.user.email",
  "user.role": "session.user.role",
  expires: "session.expires",
};

function fieldLabel(path: string): string {
  return FIELD_LABELS[path] ?? `session.${path}`;
}

function describeReceived(value: unknown): string {
  if (value === undefined) return "no value";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return Array.isArray(value) ? "an array" : `type ${typeof value}`;
}

/**
 * Validate an untrusted session value against the dashboard contract.
 *
 * Returns every violation as a specific, field-addressed message; an empty
 * error list means the value satisfies the contract.
 */
export function validateDashboardSession(
  input: unknown,
): DashboardSessionResult {
  const result = dashboardSessionSchema.safeParse(input);
  if (result.success) {
    return { ok: true, session: result.data };
  }

  const errors: string[] = [];
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    const label = fieldLabel(path);
    const received = describeReceived(receivedValue(input, path));

    switch (issue.code) {
      case "invalid_type":
        errors.push(
          `${label} must be ${issue.expected} but ${received === "no value" ? "it is missing" : `received ${received}`}`,
        );
        break;
      case "invalid_enum_value":
        errors.push(
          `${label} must be one of ${DASHBOARD_USER_ROLES.join(", ")} (received ${JSON.stringify(issue.received)})`,
        );
        break;
      case "invalid_string":
      case "too_small":
      case "custom":
      default:
        // Custom zod messages already carry the field label — only prefix when
        // they do not, so the label never appears twice.
        errors.push(
          issue.message.startsWith(label)
            ? `${issue.message} (received ${received})`
            : `${label} ${issue.message} (received ${received})`,
        );
        break;
    }
  }
  return { ok: false, errors };
}

function receivedValue(input: unknown, path: string): unknown {
  if (path === "") return input;
  let current: unknown = input;
  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** Error thrown by {@link assertDashboardSession} with all field messages attached. */
export class DashboardSessionValidationError extends Error {
  /** One specific message per contract violation. */
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid dashboard session: ${issues.join("; ")}`);
    this.name = "DashboardSessionValidationError";
    this.issues = issues;
  }
}

/**
 * Validate an untrusted session value, throwing a single
 * {@link DashboardSessionValidationError} listing every violation when the
 * contract is broken. Use at the dashboard boundary where a bad session must
 * fail loudly instead of propagating `undefined` into UI logic.
 */
export function assertDashboardSession(input: unknown): DashboardSession {
  const result = validateDashboardSession(input);
  if (!result.ok) {
    throw new DashboardSessionValidationError(result.errors);
  }
  return result.session;
}
