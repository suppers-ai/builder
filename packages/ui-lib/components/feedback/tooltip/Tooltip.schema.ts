/**
 * Tooltip Component Zod Schema
 * Defines props, types, validation, and documentation for the Tooltip component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, ColorPropsSchema, withMetadata } from "../../schemas/base.ts";

// Tooltip-specific props
const TooltipSpecificPropsSchema = z.object({
  text: z.string().describe("Tooltip text content"),

  position: withMetadata(
    z.enum(["top", "bottom", "left", "right"])
      .default("top")
      .describe("Tooltip position relative to trigger"),
    { examples: ["top", "bottom", "left", "right"], since: "1.0.0" },
  ),

  open: z.boolean()
    .optional()
    .describe("Force tooltip open state"),

  disabled: z.boolean()
    .default(false)
    .describe("Disable tooltip"),

  delay: z.number()
    .nonnegative()
    .default(0)
    .describe("Show delay in milliseconds"),

  hideDelay: z.number()
    .nonnegative()
    .default(0)
    .describe("Hide delay in milliseconds"),
});

// Complete Tooltip Props Schema
export const TooltipPropsSchema = BaseComponentPropsSchema
  .merge(ColorPropsSchema)
  .merge(TooltipSpecificPropsSchema)
  .describe("Tooltip component for displaying contextual information on hover");

// Infer TypeScript type from schema
export type TooltipProps = z.infer<typeof TooltipPropsSchema>;

// Export validation function
export const validateTooltipProps = (props: unknown): TooltipProps => {
  return TooltipPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateTooltipProps = (props: unknown) => {
  return TooltipPropsSchema.safeParse(props);
};
