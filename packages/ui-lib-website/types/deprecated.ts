/**
 * @fileoverview Deprecated type aliases for backward compatibility
 * @deprecated This file contains deprecated type aliases. Use types from packages/shared instead.
 * 
 * Migration Guide:
 * - Replace imports from this file with imports from packages/shared/types/ or packages/shared/utils/type-mappers.ts
 * - Update your code to use the canonical types from the shared package
 * - This file will be removed in a future version
 */

import type { 
  User as CanonicalUser,
  UserResponse as CanonicalUserResponse,
  UserResponseExtended as CanonicalUserResponseExtended,
  UserUpdateData as CanonicalUserUpdateData,
  AuthUser as CanonicalAuthUser,
  AuthState as CanonicalAuthState,
  AuthSession as CanonicalAuthSession
} from "../../shared/utils/type-mappers.ts";

import type {
  UpdateUserData as CanonicalUpdateUserDataAuth
} from "../../shared/types/auth.ts";

import { showPackageDeprecationWarning } from "../../shared/utils/deprecation-warnings.ts";

// Show deprecation warning
showPackageDeprecationWarning(
  'packages/ui-lib-website/types/deprecated.ts',
  'packages/shared/types/ or packages/shared/utils/type-mappers.ts'
);

/**
 * @deprecated Use User from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { User } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After  
 * import type { User } from "packages/shared/utils/type-mappers.ts";
 */
export type User = CanonicalUser;

/**
 * @deprecated Use UserResponse from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { UserResponse } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { UserResponse } from "packages/shared/utils/type-mappers.ts";
 */
export type UserResponse = CanonicalUserResponse;

/**
 * @deprecated Use UserResponseExtended from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { UserResponseExtended } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { UserResponseExtended } from "packages/shared/utils/type-mappers.ts";
 */
export type UserResponseExtended = CanonicalUserResponseExtended;

/**
 * @deprecated Use UserUpdateData from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { UserUpdateData } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { UserUpdateData } from "packages/shared/utils/type-mappers.ts";
 */
export type UserUpdateData = CanonicalUserUpdateData;

/**
 * @deprecated Use AuthUser from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { AuthUser } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { AuthUser } from "packages/shared/utils/type-mappers.ts";
 */
export type AuthUser = CanonicalAuthUser;

/**
 * @deprecated Use AuthState from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { AuthState } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { AuthState } from "packages/shared/utils/type-mappers.ts";
 */
export type AuthState = CanonicalAuthState;

/**
 * @deprecated Use AuthSession from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { AuthSession } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { AuthSession } from "packages/shared/utils/type-mappers.ts";
 */
export type AuthSession = CanonicalAuthSession;

/**
 * @deprecated Use UpdateUserData from packages/shared/types/auth.ts instead
 * @example
 * // Before
 * import type { UpdateUserData } from "packages/ui-lib-website/types/deprecated.ts";
 * 
 * // After
 * import type { UpdateUserData } from "packages/shared/types/auth.ts";
 */
export type UpdateUserData = CanonicalUpdateUserDataAuth;