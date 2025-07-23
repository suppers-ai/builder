/**
 * Timeline Component Zod Schema
 * Defines props, types, validation, and documentation for the Timeline component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// TimelineItem Schema
const TimelineItemSchema = z.object({
  id: z.string().optional().describe("Unique item identifier"),
  title: z.string().optional().describe("Item title"),
  subtitle: z.string().optional().describe("Item subtitle"),
  content: z.any().optional().describe("Item content"),
  startContent: z.any().optional().describe("Content at the start of the item"),
  icon: z.any().optional().describe("Item icon"),
  iconColor: z.string().optional().describe("Icon color"),
  badge: z.string().optional().describe("Badge text"),
  badgeColor: z.string().optional().describe("Badge color"),
  timestamp: z.string().optional().describe("Item timestamp"),
});

// Timeline-specific props
const TimelineSpecificPropsSchema = z.object({
  items: withMetadata(
    z.array(TimelineItemSchema).describe("Array of timeline items"),
    { examples: ['[{ title: "Event 1", timestamp: "2024-01-01" }]'], since: "1.0.0" },
  ),

  variant: withMetadata(
    z.enum(["vertical", "horizontal"]).default("vertical").describe("Timeline orientation"),
    { examples: ["vertical", "horizontal"], since: "1.0.0" },
  ),

  showConnectors: withMetadata(
    z.boolean().default(true).describe("Show connecting lines between items"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onItemClick: z.function()
    .args(TimelineItemSchema, z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when timeline item is clicked"),
});

// Complete Timeline Props Schema
export const TimelinePropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(TimelineSpecificPropsSchema)
  .describe("Timeline component for displaying chronological events and progress");

// Export TimelineItem schema for reuse
export { TimelineItemSchema };

// Infer TypeScript types from schemas
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type TimelineProps = z.infer<typeof TimelinePropsSchema>;

// Export validation functions
export const validateTimelineProps = (props: unknown): TimelineProps => {
  return TimelinePropsSchema.parse(props);
};

export const safeValidateTimelineProps = (props: unknown) => {
  return TimelinePropsSchema.safeParse(props);
};

export const validateTimelineItem = (item: unknown): TimelineItem => {
  return TimelineItemSchema.parse(item);
};

export const safeValidateTimelineItem = (item: unknown) => {
  return TimelineItemSchema.safeParse(item);
};
