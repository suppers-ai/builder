/**
 * @fileoverview Deprecated type aliases for backward compatibility
 * @deprecated This file contains deprecated type aliases. Use types from packages/shared instead.
 *
 * Migration Guide:
 * - Replace imports from this file with imports from packages/shared/types/auth.ts
 * - Update your code to use the canonical types from the shared package
 * - This file will be removed in a future version
 */

import type {
  AuthState as CanonicalAuthState,
  ResetPasswordData as CanonicalResetPasswordData,
  SignInData as CanonicalSignInData,
  SignUpData as CanonicalSignUpData,
  UpdateUserData as CanonicalUpdateUserData,
} from "../../shared/types/auth.ts";

import { showPackageDeprecationWarning } from "../../shared/utils/deprecation-warnings.ts";

// Show deprecation warning
showPackageDeprecationWarning(
  "packages/store/types/deprecated.ts",
  "packages/shared/types/auth.ts",
);

/**
 * @deprecated Use AuthState from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { AuthState } from "packages/store/types/deprecated.ts";
 *
 * // After
 * import type { AuthState } from "packages/shared/types/auth.ts";
 */
export type AuthState = CanonicalAuthState;

/**
 * @deprecated Use UpdateUserData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { UpdateUserData } from "packages/store/types/deprecated.ts";
 *
 * // After
 * import type { UpdateUserData } from "packages/shared/types/auth.ts";
 */
export type UpdateUserData = CanonicalUpdateUserData;

/**
 * @deprecated Use SignUpData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { SignUpData } from "packages/store/types/deprecated.ts";
 *
 * // After
 * import type { SignUpData } from "packages/shared/types/auth.ts";
 */
export type SignUpData = CanonicalSignUpData;

/**
 * @deprecated Use SignInData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { SignInData } from "packages/store/types/deprecated.ts";
 *
 * // After
 * import type { SignInData } from "packages/shared/types/auth.ts";
 */
export type SignInData = CanonicalSignInData;

/**
 * @deprecated Use ResetPasswordData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { ResetPasswordData } from "packages/store/types/deprecated.ts";
 *
 * // After
 * import type { ResetPasswordData } from "packages/shared/types/auth.ts";
 */
export type ResetPasswordData = CanonicalResetPasswordData;
