/**
 * Profile Synchronization Schema Definitions
 * Zod schemas for profile change events and related types
 */

import { z } from "zod";

// Profile change event type schema
export const ProfileChangeEventTypeSchema = z.enum([
  "theme",
  "avatar",
  "displayName",
  "profile",
  "signOut",
]);

// Profile change event data schema - varies by event type
export const ProfileChangeEventDataSchema = z.object({
  // For theme changes
  theme: z.string().optional(),

  // For avatar changes
  avatarUrl: z.string().url().optional(),

  // For display name changes
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),

  // For full profile updates
  user: z.record(z.any()).optional(),

  // For sign out events
  reason: z.string().optional(),
}).strict();

// Main profile change event schema
export const ProfileChangeEventSchema = z.object({
  type: ProfileChangeEventTypeSchema,
  data: ProfileChangeEventDataSchema,
  timestamp: z.number().int().positive(),
  source: z.string().min(1, "Source application name is required"),
  userId: z.string().uuid("Invalid user ID format"),
}).strict();

// Profile popup dimensions schema
export const ProfilePopupDimensionsSchema = z.object({
  width: z.number().int().positive().min(300).max(1920),
  height: z.number().int().positive().min(400).max(1080),
}).strict();

// Profile popup position schema
export const ProfilePopupPositionSchema = z.enum(["center", "right", "left"]);

// Profile popup options schema
export const ProfilePopupOptionsSchema = z.object({
  origin: z.string().url("Invalid origin URL"),
  appName: z.string().min(1, "App name is required"),
  dimensions: ProfilePopupDimensionsSchema.optional(),
  position: ProfilePopupPositionSchema.optional(),
}).strict();

// Serialized profile change event schema (for storage/transmission)
export const SerializedProfileChangeEventSchema = z.object({
  type: ProfileChangeEventTypeSchema,
  data: z.string(), // JSON stringified data
  timestamp: z.number().int().positive(),
  source: z.string().min(1),
  userId: z.string().uuid(),
  checksum: z.string().optional(), // For integrity validation
}).strict();

// Event validation result schema
export const EventValidationResultSchema = z.object({
  isValid: z.boolean(),
  event: ProfileChangeEventSchema.optional(),
  errors: z.array(z.string()).default([]),
}).strict();

// Popup fallback options schema
export const PopupFallbackOptionsSchema = z.object({
  showNotification: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  useModal: z.boolean().optional(),
  onFallback: z.function().args(z.enum(["blocked", "failed", "mobile"])).returns(z.void())
    .optional(),
}).strict();

// Export inferred types
export type ProfileChangeEventType = z.infer<typeof ProfileChangeEventTypeSchema>;
export type ProfileChangeEventData = z.infer<typeof ProfileChangeEventDataSchema>;
export type ProfileChangeEvent = z.infer<typeof ProfileChangeEventSchema>;
export type ProfilePopupDimensions = z.infer<typeof ProfilePopupDimensionsSchema>;
export type ProfilePopupPosition = z.infer<typeof ProfilePopupPositionSchema>;
export type ProfilePopupOptions = z.infer<typeof ProfilePopupOptionsSchema>;
export type PopupFallbackOptions = z.infer<typeof PopupFallbackOptionsSchema>;
export type SerializedProfileChangeEvent = z.infer<typeof SerializedProfileChangeEventSchema>;
export type EventValidationResult = z.infer<typeof EventValidationResultSchema>;
