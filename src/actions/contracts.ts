/**
 * Shared, precise contracts for every public action exported from
 * src/actions/. This module is plain TypeScript (no "use server") so it can
 * be imported by actions, tests and documentation alike.
 *
 * Conventions for all actions in this directory:
 * - Auth-style actions (login/register/reset/new-password/logout) NEVER throw
 *   for expected failures. They return a discriminated result in which
 *   exactly one of `error` / `success` is present.
 * - Generation actions (get-AI) throw `AiActionError` for expected failures
 *   so the failure mode is loud and machine-readable; unexpected errors are
 *   never wrapped, they propagate untouched.
 * - Every action validates all user-controlled input at this boundary before
 *   touching the database, the mailer or an upstream API.
 */

/** Auth-style action failure: a specific, user-presentable message. */
export type FieldError = {
  success?: undefined;
  error: string;
};

/** Auth-style action success: a specific, user-presentable message. */
export type FieldSuccess = {
  success: string;
  error?: undefined;
};

/**
 * The union every auth-style action returns. Narrow with `"error" in result`.
 * The `success?/error?: undefined` sentinels keep the runtime shape identical
 * to what the actions have always returned while making the union
 * discriminable at the type level.
 */
export type AuthActionResult = FieldSuccess | FieldError;

/** Machine-readable failure codes thrown by the generation actions. */
export const AI_ERROR_CODES = [
  /** The caller-supplied generation context failed boundary validation. */
  "GENERATION_INPUT_INVALID",
  /** The upstream Flask API could not be reached or returned a non-OK status. */
  "GENERATION_UPSTREAM_UNREACHABLE",
  /** The upstream Flask API reported an application error. */
  "GENERATION_UPSTREAM_ERROR",
  /** The upstream Flask API returned a body that does not match the contract. */
  "GENERATION_RESPONSE_MALFORMED",
] as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[number];

/** Error thrown by the generation actions in src/actions/get-AI.ts. */
export class AiActionError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiActionError";
    this.code = code;
  }
}
