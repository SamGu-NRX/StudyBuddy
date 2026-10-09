import { vi } from "vitest";

/**
 * Shared test doubles for the src/actions/ contract tests.
 *
 * Usage in a test file:
 *
 *   import { beforeEach, describe, expect, it, vi } from "vitest";
 *
 *   vi.mock("@/lib/db", async () => {
 *     const { dbMock } = await import("./__tests__/helpers"); // from src/actions/
 *     return { db: dbMock };                                  // or "./helpers" from __tests__/
 *   });
 *   vi.mock("@/../auth", async () => {
 *     const { authRouteModuleMock } = await import("./__tests__/helpers");
 *     return authRouteModuleMock;
 *   });
 *   vi.mock("next-auth", async () => {
 *     const { nextAuthModuleMock } = await import("./__tests__/helpers");
 *     return nextAuthModuleMock;
 *   });
 *   vi.mock("@/data/user", async () => {
 *     const { dataMocks } = await import("./__tests__/helpers");
 *     return dataMocks;
 *   });
 *   vi.mock("@/lib/tokens", async () => {
 *     const { tokenMocks } = await import("./__tests__/helpers");
 *     return tokenMocks;
 *   });
 *   vi.mock("@/lib/mail", async () => {
 *     const { mailMocks } = await import("./__tests__/helpers");
 *     return mailMocks;
 *   });
 *   vi.mock("@/data/password-reset-token", async () => {
 *     const { dataMocks } = await import("./__tests__/helpers");
 *     return dataMocks;
 *   });
 *
 * Reset every double in a `beforeEach(() => resetActionMocks())`.
 */

/**
 * Mirrors next-auth's AuthError closely enough for `instanceof` + `.type`
 * checks in the actions.
 */
export class MockAuthError extends Error {
  readonly type: string;

  constructor(type: string, message?: string) {
    super(message ?? `auth error: ${type}`);
    this.name = "AuthError";
    this.type = type;
  }
}

/**
 * Mirrors next-auth's CredentialsSignin, whose `.type` is "CredentialsSignin".
 */
export class MockCredentialsSignin extends MockAuthError {
  constructor(message = "Invalid credentials") {
    super("CredentialsSignin", message);
    this.name = "CredentialsSignin";
  }
}

/**
 * The mocked "next-auth" module.
 *
 * CRITICAL: the default export below deliberately mimics the REAL default
 * export of next-auth v5 — the NextAuth factory function, NOT the AuthError
 * class. src/actions/login.ts (as of this writing) does
 * `import AuthError from "next-auth"`, binding the factory to the name
 * `AuthError`; the mock must reproduce that reality so contract tests capture
 * the resulting bug instead of accidentally masking it.
 */
export const nextAuthModuleMock = {
  default: function nextAuthFactory(): never {
    throw new Error(
      "next-auth default export (the NextAuth factory) must not be invoked in tests",
    );
  },
  AuthError: MockAuthError,
  CredentialsSignin: MockCredentialsSignin,
};

/** Doubles for the "@/../auth" module (NextAuth entry). */
export const signInMock = vi.fn<(...args: unknown[]) => Promise<void>>();
export const signOutMock = vi.fn<(...args: unknown[]) => Promise<void>>();
export const authRouteModuleMock = {
  auth: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  signIn: signInMock,
  signOut: signOutMock,
};

/** Doubles for "@/lib/db" (Prisma client), limited to what the actions touch. */
export const dbUserMocks = {
  findUnique: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  create: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  update: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
};
export const dbVerificationTokenMocks = {
  findUnique: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  create: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  delete: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
};
export const dbPasswordResetTokenMocks = {
  findUnique: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  create: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  delete: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
};
export const dbMock = {
  user: dbUserMocks,
  verificationToken: dbVerificationTokenMocks,
  passwordResetToken: dbPasswordResetTokenMocks,
};

/** Doubles for "@/data/user" and "@/data/password-reset-token". */
export const getUserByEmailMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const getPasswordResetTokenByTokenMock =
  vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const dataMocks = {
  getUserByEmail: getUserByEmailMock,
  getPasswordResetTokenByToken: getPasswordResetTokenByTokenMock,
};

/** Doubles for "@/lib/tokens". */
export const generateVerificationTokenMock =
  vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const generatePasswordResetTokenMock =
  vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const tokenMocks = {
  generateVerificationToken: generateVerificationTokenMock,
  generatePasswordResetToken: generatePasswordResetTokenMock,
};

/** Doubles for "@/lib/mail". */
export const sendVerificationEmailMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const sendPasswordResetEmailMock = vi.fn<(...args: unknown[]) => Promise<unknown>>();
export const mailMocks = {
  sendVerificationEmail: sendVerificationEmailMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
};

/** Reset every shared double. Call from beforeEach. */
export function resetActionMocks(): void {
  const all: Array<{ mockReset(): void }> = [
    signInMock,
    signOutMock,
    ...Object.values(dbUserMocks),
    ...Object.values(dbVerificationTokenMocks),
    ...Object.values(dbPasswordResetTokenMocks),
    getUserByEmailMock,
    getPasswordResetTokenByTokenMock,
    generateVerificationTokenMock,
    generatePasswordResetTokenMock,
    sendVerificationEmailMock,
    sendPasswordResetEmailMock,
  ];
  for (const mock of all) {
    mock.mockReset();
  }
}

/** Fields the actions actually read from a user row. */
export type TestUser = {
  id: string;
  email: string;
  password: string | null;
  emailVerified: Date | null;
  firstName: string;
  lastName: string;
  firstTime: boolean;
};

/** A verified user with a password, matching what the DB layer returns. */
export function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: "usr_123",
    email: "student@studybuddy.test",
    password: "hashed-password",
    emailVerified: new Date("2026-01-01T00:00:00Z"),
    firstName: "Ada",
    lastName: "Lovelace",
    firstTime: false,
    ...overrides,
  };
}

/** Fields the actions actually read from a token row. */
export type TestTokenRow = {
  id: string;
  email: string;
  token: string;
  expires: Date;
};

/** A password-reset/verification token row that expires in an hour. */
export function makeTokenRow(overrides: Partial<TestTokenRow> = {}): TestTokenRow {
  return {
    id: "tok_123",
    email: "student@studybuddy.test",
    token: "00000000-0000-4000-8000-000000000000",
    expires: new Date(Date.now() + 60 * 60 * 1000),
    ...overrides,
  };
}
