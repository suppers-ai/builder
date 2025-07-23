/**
 * Badge Component Zod Schema
 * Defines props, types, validation, and documentation for the Badge component
 */

import { z } from "zod";
import { DisplayBaseSchema, withMetadata } from "../../schemas/base.ts";

// Badge-specific props
const BadgeSpecificPropsSchema = z.object({
  content: z.union([z.string(), z.number()])
    .optional()
    .describe("Badge content (text or number)"),

  position: withMetadata(
    z.enum(["top-right", "top-left", "bottom-right", "bottom-left"])
      .optional()
      .describe("Badge position when used as indicator"),
    { examples: ["top-right", "top-left", "bottom-right", "bottom-left"], since: "1.0.0" },
  ),
});

// Complete Badge Props Schema
export const BadgePropsSchema = DisplayBaseSchema
  .merge(BadgeSpecificPropsSchema)
  .describe("Badge component for labels, indicators, and status markers");

// Infer TypeScript type from schema
export type BadgeProps = z.infer<typeof BadgePropsSchema>;

// Export validation function
export const validateBadgeProps = (props: unknown): BadgeProps => {
  return BadgePropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateBadgeProps = (props: unknown) => {
  return BadgePropsSchema.safeParse(props);
};
