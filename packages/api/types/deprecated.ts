/**
 * @fileoverview Deprecated type aliases for backward compatibility
 * @deprecated This file contains deprecated type aliases. Use types from packages/shared instead.
 * 
 * Migration Guide:
 * - Replace imports from this file with imports from packages/shared/utils/type-mappers.ts
 * - Update your code to use the canonical types from the shared package
 * - This file will be removed in a future version
 */

import type { 
  UserResponse as CanonicalUserResponse,
  UserResponseExtended as CanonicalUserResponseExtended
} from "../../shared/utils/type-mappers.ts";

import { showPackageDeprecationWarning } from "../../shared/utils/deprecation-warnings.ts";

// Show deprecation warning
showPackageDeprecationWarning(
  'packages/api/types/deprecated.ts',
  'packages/shared/utils/type-mappers.ts'
);

/**
 * @deprecated Use UserResponse from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { UserResponse } from "packages/api/types/deprecated.ts";
 * 
 * // After  
 * import type { UserResponse } from "packages/shared/utils/type-mappers.ts";
 */
export type UserResponse = CanonicalUserResponse;

/**
 * @deprecated Use UserResponseExtended from packages/shared/utils/type-mappers.ts instead
 * @example
 * // Before
 * import type { UserResponseExtended } from "packages/api/types/deprecated.ts";
 * 
 * // After
 * import type { UserResponseExtended } from "packages/shared/utils/type-mappers.ts";
 */
export type UserResponseExtended = CanonicalUserResponseExtended;