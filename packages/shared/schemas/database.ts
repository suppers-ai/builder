/**
 * Database Schema Definitions
 * Zod schemas for database tables and operations
 */

import { z } from "zod";

// Base Table Schema (common fields for all tables)
export const BaseTableSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Enum Schemas
export const UserRoleSchema = z.enum(["user", "admin", "moderator"]);
export const ApplicationStatusSchema = z.enum(["draft", "pending", "published", "archived"]);
export const AccessLevelSchema = z.enum(["read", "write", "admin"]);
export const ReviewActionSchema = z.enum(["approved", "rejected"]);

// Users Table Schema
export const UsersTableSchema = BaseTableSchema.extend({
  email: z.string().email("Invalid email format"),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema,
});

export const UsersInsertSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema.default("user"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const UsersUpdateSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  middle_names: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: UserRoleSchema.optional(),
  updated_at: z.string().datetime().optional(),
});

// Applications Table Schema
export const ApplicationsTableSchema = BaseTableSchema.extend({
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
  template_id: z.string().min(1, "Template ID is required"),
  configuration: z.record(z.unknown()),
  status: ApplicationStatusSchema,
  owner_id: z.string().uuid(),
});

export const ApplicationsInsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
  template_id: z.string().min(1, "Template ID is required"),
  configuration: z.record(z.unknown()),
  status: ApplicationStatusSchema.default("draft"),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ApplicationsUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  template_id: z.string().min(1).optional(),
  configuration: z.record(z.unknown()).optional(),
  status: ApplicationStatusSchema.optional(),
  updated_at: z.string().datetime().optional(),
});

// User Access Table Schema
export const UserAccessTableSchema = BaseTableSchema.extend({
  application_id: z.string().uuid(),
  user_id: z.string().uuid(),
  access_level: AccessLevelSchema,
  granted_by: z.string().uuid(),
  granted_at: z.string().datetime(),
});

export const UserAccessInsertSchema = z.object({
  id: z.string().uuid().optional(),
  application_id: z.string().uuid(),
  user_id: z.string().uuid(),
  access_level: AccessLevelSchema,
  granted_by: z.string().uuid(),
  granted_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const UserAccessUpdateSchema = z.object({
  access_level: AccessLevelSchema.optional(),
  updated_at: z.string().datetime().optional(),
});

// Application Reviews Table Schema
export const ApplicationReviewsTableSchema = BaseTableSchema.extend({
  application_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  action: ReviewActionSchema,
  feedback: z.string().optional(),
  reviewed_at: z.string().datetime(),
});

export const ApplicationReviewsInsertSchema = z.object({
  id: z.string().uuid().optional(),
  application_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  action: ReviewActionSchema,
  feedback: z.string().optional(),
  reviewed_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ApplicationReviewsUpdateSchema = z.object({
  action: ReviewActionSchema.optional(),
  feedback: z.string().optional(),
  updated_at: z.string().datetime().optional(),
});

// Custom Themes Table Schema
export const CustomThemesTableSchema = BaseTableSchema.extend({
  name: z.string().min(1, "Theme name is required"),
  label: z.string().min(1, "Theme label is required"),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])),
  is_public: z.boolean(),
  created_by: z.string().uuid(),
});

export const CustomThemesInsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Theme name is required"),
  label: z.string().min(1, "Theme label is required"),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CustomThemesUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])).optional(),
  is_public: z.boolean().optional(),
  updated_at: z.string().datetime().optional(),
});

// Database Schema Type
export const DatabaseSchema = z.object({
  public: z.object({
    Tables: z.object({
      users: z.object({
        Row: UsersTableSchema,
        Insert: UsersInsertSchema,
        Update: UsersUpdateSchema,
      }),
      applications: z.object({
        Row: ApplicationsTableSchema,
        Insert: ApplicationsInsertSchema,
        Update: ApplicationsUpdateSchema,
      }),
      user_access: z.object({
        Row: UserAccessTableSchema,
        Insert: UserAccessInsertSchema,
        Update: UserAccessUpdateSchema,
      }),
      application_reviews: z.object({
        Row: ApplicationReviewsTableSchema,
        Insert: ApplicationReviewsInsertSchema,
        Update: ApplicationReviewsUpdateSchema,
      }),
      custom_themes: z.object({
        Row: CustomThemesTableSchema,
        Insert: CustomThemesInsertSchema,
        Update: CustomThemesUpdateSchema,
      }),
    }),
    Views: z.object({}),
    Functions: z.object({}),
    Enums: z.object({
      user_role: UserRoleSchema,
      application_status: ApplicationStatusSchema,
      access_level: AccessLevelSchema,
      review_action: ReviewActionSchema,
    }),
  }),
});

// Query Options Schema
export const QueryOptionsSchema = z.object({
  select: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  orderBy: z.object({
    column: z.string().min(1, "Order by column is required"),
    ascending: z.boolean().default(true),
  }).optional(),
  filters: z.array(z.object({
    column: z.string().min(1, "Filter column is required"),
    operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in", "is"]),
    value: z.any(),
  })).optional(),
});

// Relationship Schemas
export const UserWithApplicationsSchema = UsersTableSchema.extend({
  applications: z.array(ApplicationsTableSchema),
});

export const ApplicationWithOwnerSchema = ApplicationsTableSchema.extend({
  owner: UsersTableSchema,
});

export const ApplicationWithReviewsSchema = ApplicationsTableSchema.extend({
  reviews: z.array(ApplicationReviewsTableSchema),
});

export const UserAccessWithUserSchema = UserAccessTableSchema.extend({
  user: UsersTableSchema,
});

export const UserAccessWithApplicationSchema = UserAccessTableSchema.extend({
  application: ApplicationsTableSchema,
});

// Export inferred types
export type BaseTable = z.infer<typeof BaseTableSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type AccessLevel = z.infer<typeof AccessLevelSchema>;
export type ReviewAction = z.infer<typeof ReviewActionSchema>;
export type UsersTable = z.infer<typeof UsersTableSchema>;
export type UsersInsert = z.infer<typeof UsersInsertSchema>;
export type UsersUpdate = z.infer<typeof UsersUpdateSchema>;
export type ApplicationsTable = z.infer<typeof ApplicationsTableSchema>;
export type ApplicationsInsert = z.infer<typeof ApplicationsInsertSchema>;
export type ApplicationsUpdate = z.infer<typeof ApplicationsUpdateSchema>;
export type UserAccessTable = z.infer<typeof UserAccessTableSchema>;
export type UserAccessInsert = z.infer<typeof UserAccessInsertSchema>;
export type UserAccessUpdate = z.infer<typeof UserAccessUpdateSchema>;
export type ApplicationReviewsTable = z.infer<typeof ApplicationReviewsTableSchema>;
export type ApplicationReviewsInsert = z.infer<typeof ApplicationReviewsInsertSchema>;
export type ApplicationReviewsUpdate = z.infer<typeof ApplicationReviewsUpdateSchema>;
export type CustomThemesTable = z.infer<typeof CustomThemesTableSchema>;
export type CustomThemesInsert = z.infer<typeof CustomThemesInsertSchema>;
export type CustomThemesUpdate = z.infer<typeof CustomThemesUpdateSchema>;
export type Database = z.infer<typeof DatabaseSchema>;
export type QueryOptions = z.infer<typeof QueryOptionsSchema>;
export type UserWithApplications = z.infer<typeof UserWithApplicationsSchema>;
export type ApplicationWithOwner = z.infer<typeof ApplicationWithOwnerSchema>;
export type ApplicationWithReviews = z.infer<typeof ApplicationWithReviewsSchema>;
export type UserAccessWithUser = z.infer<typeof UserAccessWithUserSchema>;
export type UserAccessWithApplication = z.infer<typeof UserAccessWithApplicationSchema>;