/**
 * UserProfileDropdown Component Zod Schema
 * Defines props, types, validation, and documentation for the UserProfileDropdown component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// AuthUser Schema (simplified version for validation)
const AuthUserSchema = z.object({
  id: z.string().describe("User unique identifier"),
  email: z.string().email().describe("User email address"),
  name: z.string().optional().describe("User display name"),
  avatar_url: z.string().url().optional().describe("User avatar image URL"),
});

// UserProfileDropdown-specific props
const UserProfileDropdownSpecificPropsSchema = z.object({
  user: withMetadata(
    AuthUserSchema.describe("User object containing profile information"),
    { examples: ['{ id: "1", email: "user@example.com", name: "John Doe" }'], since: "1.0.0" },
  ),

  onLogout: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when logout is clicked"),

  onProfile: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when profile menu item is clicked"),

  onSettings: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when settings menu item is clicked"),

  onAdmin: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when admin menu item is clicked"),

  showAdmin: withMetadata(
    z.boolean().default(false).describe("Whether to show admin menu item"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  profileHref: z.string()
    .default("/profile")
    .describe("URL for profile page navigation"),

  settingsHref: z.string()
    .default("/settings")
    .describe("URL for settings page navigation"),

  adminHref: z.string()
    .default("/admin")
    .describe("URL for admin page navigation"),

  class: z.string()
    .optional()
    .describe("Additional CSS classes"),
});

// Complete UserProfileDropdown Props Schema
export const UserProfileDropdownPropsSchema = BaseComponentPropsSchema
  .merge(UserProfileDropdownSpecificPropsSchema)
  .describe("User profile dropdown menu with avatar, user info, and common navigation actions");

// Export AuthUser schema for reuse
export { AuthUserSchema };

// Infer TypeScript types from schemas
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type UserProfileDropdownProps = z.infer<typeof UserProfileDropdownPropsSchema>;

// Export validation functions
export const validateUserProfileDropdownProps = (props: unknown): UserProfileDropdownProps => {
  return UserProfileDropdownPropsSchema.parse(props);
};

export const safeValidateUserProfileDropdownProps = (props: unknown) => {
  return UserProfileDropdownPropsSchema.safeParse(props);
};

export const validateAuthUser = (user: unknown): AuthUser => {
  return AuthUserSchema.parse(user);
};

export const safeValidateAuthUser = (user: unknown) => {
  return AuthUserSchema.safeParse(user);
};
