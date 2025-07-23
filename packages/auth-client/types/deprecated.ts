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
  AuthUser as CanonicalAuthUser,
  AuthState as CanonicalAuthState,
  AuthSession as CanonicalAuthSession,
  UpdateUserData as CanonicalUpdateUserData,
  UserRole as CanonicalUserRole,
  AccessLevel as CanonicalAccessLevel
} from "../../shared/types/auth.ts";

import { showPackageDeprecationWarning } from "../../shared/utils/deprecation-warnings.ts";

// Show deprecation warning
showPackageDeprecationWarning(
  'packages/auth-client/types/deprecated.ts',
  'packages/shared/types/auth.ts'
);

/**
 * @deprecated Use AuthUser from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { AuthUser } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After  
 * import type { AuthUser } from "packages/shared/types/auth.ts";
 */
export type AuthUser = CanonicalAuthUser;

/**
 * @deprecated Use AuthState from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { AuthState } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After
 * import type { AuthState } from "packages/shared/types/auth.ts";
 */
export type AuthState = CanonicalAuthState;

/**
 * @deprecated Use AuthSession from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { AuthSession } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After
 * import type { AuthSession } from "packages/shared/types/auth.ts";
 */
export type AuthSession = CanonicalAuthSession;

/**
 * @deprecated Use UpdateUserData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { UpdateUserData } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After
 * import type { UpdateUserData } from "packages/shared/types/auth.ts";
 */
export type UpdateUserData = CanonicalUpdateUserData;

/**
 * @deprecated Use UserRole from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { UserRole } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After
 * import type { UserRole } from "packages/shared/types/auth.ts";
 */
export type UserRole = CanonicalUserRole;

/**
 * @deprecated Use AccessLevel from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { AccessLevel } from "packages/auth-client/types/deprecated.ts";
 * 
 * // After
 * import type { AccessLevel } from "packages/shared/types/auth.ts";
 */
export type AccessLevel = CanonicalAccessLevel;