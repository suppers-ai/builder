/**
 * API Schema Definitions
 * Zod schemas for API requests, responses, and data structures
 */

import { z } from "zod";

// HTTP Method Schema
export const HttpMethodSchema = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]);

// HTTP Status Schema
export const HttpStatusSchema = z.union([
  z.literal(200),
  z.literal(201),
  z.literal(204),
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(409),
  z.literal(422),
  z.literal(500),
  z.literal(502),
  z.literal(503),
]);

// Generic API Response Schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    success: z.boolean(),
    status: HttpStatusSchema,
    meta: z.object({
      total: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      hasMore: z.boolean().optional(),
    }).optional(),
  });

// API Error Schema
export const ApiErrorSchema = z.object({
  message: z.string().min(1, "Error message is required"),
  code: z.string().optional(),
  status: HttpStatusSchema,
  details: z.record(z.any()).optional(),
});

// Pagination Parameters Schema
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().optional(),
});

// Sorting Parameters Schema
export const SortParamsSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Search Parameters Schema
export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

// Combined Query Parameters Schema
export const QueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  include: z.array(z.string()).optional(),
  fields: z.array(z.string()).optional(),
});

// Request Configuration Schema
export const RequestConfigSchema = z.object({
  url: z.string().url().optional(),
  endpoint: z.string().min(1, "Endpoint is required"),
  method: HttpMethodSchema.default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  params: z.record(z.union([z.string(), z.number()])).optional(),
  timeout: z.number().positive().optional(),
});

// Application Data Schemas
export const ApplicationStatusSchema = z.enum(["draft", "pending", "published", "archived"]);

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
  template_id: z.string().min(1, "Template ID is required"),
  configuration: z.record(z.unknown()),
  status: ApplicationStatusSchema,
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateApplicationDataSchema = z.object({
  name: z.string().min(1, "Application name is required"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template ID is required"),
  configuration: z.record(z.unknown()),
  status: ApplicationStatusSchema.default("draft"),
});

export const UpdateApplicationDataSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  templateId: z.string().min(1).optional(),
  configuration: z.record(z.unknown()).optional(),
  status: ApplicationStatusSchema.optional(),
});

// User Access Schemas
export const AccessLevelSchema = z.enum(["read", "write", "admin"]);

export const UserAccessSchema = z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  user_id: z.string().uuid(),
  access_level: AccessLevelSchema,
  granted_by: z.string().uuid(),
  granted_at: z.string().datetime(),
});

export const GrantAccessDataSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  userId: z.string().uuid("Invalid user ID"),
  accessLevel: AccessLevelSchema,
});

// Application Review Schemas
export const ReviewActionSchema = z.enum(["approved", "rejected"]);

export const ApplicationReviewSchema = z.object({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  action: ReviewActionSchema,
  feedback: z.string().optional(),
  reviewed_at: z.string().datetime(),
});

export const CreateReviewDataSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  action: ReviewActionSchema,
  feedback: z.string().optional(),
});

// Custom Theme Schemas
export const CustomThemeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Theme name is required"),
  label: z.string().min(1, "Theme label is required"),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])),
  is_public: z.boolean(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateCustomThemeDataSchema = z.object({
  name: z.string().min(1, "Theme name is required"),
  label: z.string().min(1, "Theme label is required"),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])),
  is_public: z.boolean().default(false),
});

export const UpdateCustomThemeDataSchema = z.object({
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])).optional(),
  is_public: z.boolean().optional(),
});

// File Upload Schemas
export const FileUploadDataSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  path: z.string().optional(),
  bucket: z.string().optional(),
  options: z.object({
    cacheControl: z.string().optional(),
    contentType: z.string().optional(),
    upsert: z.boolean().optional(),
  }).optional(),
});

export const FileUploadResponseSchema = z.object({
  path: z.string(),
  publicUrl: z.string().url(),
  signedUrl: z.string().url().optional(),
});

// Webhook Schemas
export const WebhookPayloadSchema = z.object({
  event: z.string().min(1, "Event name is required"),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
});

// Rate Limiting Schemas
export const RateLimitInfoSchema = z.object({
  limit: z.number().positive(),
  remaining: z.number().nonnegative(),
  reset: z.number().positive(),
  retryAfter: z.number().positive().optional(),
});

// Common validation schemas
export const UuidSchema = z.string().uuid("Invalid UUID format");
export const EmailSchema = z.string().email("Invalid email format");
export const UrlSchema = z.string().url("Invalid URL format");
export const SlugSchema = z.string().regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
);

// Export inferred types
export type HttpMethod = z.infer<typeof HttpMethodSchema>;
export type HttpStatus = z.infer<typeof HttpStatusSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type SortParams = z.infer<typeof SortParamsSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;
export type RequestConfig = z.infer<typeof RequestConfigSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationData = z.infer<typeof CreateApplicationDataSchema>;
export type UpdateApplicationData = z.infer<typeof UpdateApplicationDataSchema>;
export type AccessLevel = z.infer<typeof AccessLevelSchema>;
export type UserAccess = z.infer<typeof UserAccessSchema>;
export type GrantAccessData = z.infer<typeof GrantAccessDataSchema>;
export type ReviewAction = z.infer<typeof ReviewActionSchema>;
export type ApplicationReview = z.infer<typeof ApplicationReviewSchema>;
export type CreateReviewData = z.infer<typeof CreateReviewDataSchema>;
export type CustomTheme = z.infer<typeof CustomThemeSchema>;
export type CreateCustomThemeData = z.infer<typeof CreateCustomThemeDataSchema>;
export type UpdateCustomThemeData = z.infer<typeof UpdateCustomThemeDataSchema>;
export type FileUploadData = z.infer<typeof FileUploadDataSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;
