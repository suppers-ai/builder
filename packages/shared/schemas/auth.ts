/**
 * Authentication Schema Definitions
 * Zod schemas for authentication, users, and permissions
 */

import { z } from "zod";

// User Role Schema
export const UserRoleSchema = z.enum(["user", "admin", "moderator"]);

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
  email: z.string().email("Invalid email format"),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User Insert Schema (for creating new users)
export const UserInsertSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema.optional().default("user"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// User Update Schema (for updating existing users)
export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema.optional(),
  updated_at: z.string().datetime().optional(),
});

// Authentication Session Schema
export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().positive(),
  expires_at: z.number().optional(),
  token_type: z.string().default("Bearer"),
  user: UserSchema,
});

// Login Credentials Schema
export const LoginCredentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Registration Data Schema
export const RegistrationDataSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
});

// Password Reset Request Schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Password Reset Schema
export const PasswordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

// Email Verification Schema
export const EmailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// OAuth Provider Schema
export const OAuthProviderSchema = z.enum([
  "google",
  "github",
  "discord",
  "facebook",
  "twitter",
  "microsoft",
  "apple",
]);

// OAuth Configuration Schema
export const OAuthConfigSchema = z.object({
  provider: OAuthProviderSchema,
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client secret is required"),
  redirect_uri: z.string().url("Invalid redirect URI"),
  scopes: z.array(z.string()).optional().default([]),
  enabled: z.boolean().default(true),
});

// Permission Schema
export const PermissionSchema = z.object({
  id: z.string().min(1, "Permission ID is required"),
  name: z.string().min(1, "Permission name is required"),
  description: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
});

// Role Schema (for role-based access control)
export const RoleSchema = z.object({
  id: z.string().min(1, "Role ID is required"),
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  is_system_role: z.boolean().default(false),
});

// User Session Context Schema
export const UserSessionContextSchema = z.object({
  user: UserSchema.optional(),
  session: AuthSessionSchema.optional(),
  permissions: z.array(z.string()).default([]),
  isAuthenticated: z.boolean().default(false),
  isLoading: z.boolean().default(false),
});

// JWT Payload Schema
export const JWTPayloadSchema = z.object({
  sub: z.string().uuid("Invalid user ID in JWT"),
  email: z.string().email("Invalid email in JWT"),
  role: UserRoleSchema,
  permissions: z.array(z.string()).optional().default([]),
  iat: z.number(),
  exp: z.number(),
  aud: z.string().optional(),
  iss: z.string().optional(),
});

// API Key Schema
export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  key_name: z.string().min(1, "API key name is required"),
  key_hash: z.string(),
  permissions: z.array(z.string()).default([]),
  expires_at: z.string().datetime().optional(),
  last_used_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean().default(true),
});

// Export inferred types
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegistrationData = z.infer<typeof RegistrationDataSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordReset = z.infer<typeof PasswordResetSchema>;
export type EmailVerification = z.infer<typeof EmailVerificationSchema>;
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;
export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type UserSessionContext = z.infer<typeof UserSessionContextSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
