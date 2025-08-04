/**
 * EntityCard Component Zod Schema
 * Defines props, types, validation, and documentation for the EntityCard component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Entity Status schema
const EntityStatusSchema = z.object({
  value: z.string().describe("Status identifier/key"),
  icon: z.string().describe("Status icon (emoji or icon name)"),
  message: z.string().describe("Status message/description"),
  badgeClass: z.string().describe("CSS class for badge styling"),
});

// Entity Action schema
const EntityActionSchema = z.object({
  label: z.string().describe("Action button label"),
  icon: z.string().describe("Action icon (emoji or icon name)"),
  onClick: z.function()
    .args()
    .returns(z.void())
    .describe("Action click handler"),
  variant: z.enum(["primary", "success", "warning", "error"])
    .optional()
    .describe("Action button variant/color"),
  condition: z.boolean()
    .optional()
    .describe("Condition to show/hide action"),
});

// Entity Menu Action schema
const EntityMenuActionSchema = z.object({
  label: z.string().describe("Menu action label"),
  icon: z.string().describe("Menu action icon (emoji or icon name)"),
  onClick: z.function()
    .args()
    .returns(z.void())
    .describe("Menu action click handler"),
  className: z.string()
    .optional()
    .describe("Additional CSS classes for menu item"),
  condition: z.boolean()
    .optional()
    .describe("Condition to show/hide menu action"),
});

// Entity Status Configuration schema
const EntityStatusConfigSchema = z.object({
  value: z.string().describe("Current status value"),
  statuses: z.record(z.string(), EntityStatusSchema)
    .describe("Map of status values to status configurations"),
});

// EntityCard-specific props
const EntityCardSpecificPropsSchema = z.object({
  title: z.string().describe("Entity title/name"),

  subtitle: z.string()
    .optional()
    .describe("Optional entity subtitle"),

  description: z.string()
    .optional()
    .describe("Entity description"),

  updatedAt: withMetadata(
    z.string().describe("Last update timestamp (ISO string)"),
    { examples: ["2024-01-15T10:30:00Z"], since: "1.0.0" },
  ),

  status: EntityStatusConfigSchema
    .describe("Entity status configuration"),

  metadata: z.record(z.string(), z.any())
    .optional()
    .describe("Additional entity metadata for display"),

  actions: z.array(EntityActionSchema)
    .default([])
    .describe("Primary actions displayed as buttons"),

  menuActions: z.array(EntityMenuActionSchema)
    .default([])
    .describe("Secondary actions displayed in dropdown menu"),

  showOwnerActions: z.boolean()
    .default(false)
    .describe("Whether to show owner/admin actions"),

  onView: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("View details handler"),
});

// Complete EntityCard Props Schema
export const EntityCardPropsSchema = BaseComponentPropsSchema
  .merge(EntityCardSpecificPropsSchema)
  .describe("Comprehensive entity display card with status, actions, and metadata");

// Export related schemas for reuse
export { EntityActionSchema, EntityMenuActionSchema, EntityStatusConfigSchema, EntityStatusSchema };

// Infer TypeScript types from schemas
export type EntityStatus = z.infer<typeof EntityStatusSchema>;
export type EntityAction = z.infer<typeof EntityActionSchema>;
export type EntityMenuAction = z.infer<typeof EntityMenuActionSchema>;
export type EntityStatusConfig = z.infer<typeof EntityStatusConfigSchema>;
export type EntityCardProps = z.infer<typeof EntityCardPropsSchema>;

// Export validation functions
export const validateEntityCardProps = (props: unknown): EntityCardProps => {
  return EntityCardPropsSchema.parse(props);
};

export const safeValidateEntityCardProps = (props: unknown) => {
  return EntityCardPropsSchema.safeParse(props);
};

export const validateEntityStatus = (status: unknown): EntityStatus => {
  return EntityStatusSchema.parse(status);
};

export const validateEntityAction = (action: unknown): EntityAction => {
  return EntityActionSchema.parse(action);
};

export const validateEntityMenuAction = (action: unknown): EntityMenuAction => {
  return EntityMenuActionSchema.parse(action);
};
