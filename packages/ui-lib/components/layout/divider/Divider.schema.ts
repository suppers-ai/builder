/**
 * Divider Component Zod Schema
 * Defines props, types, validation, and documentation for the Divider component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Divider-specific props
const DividerSpecificPropsSchema = z.object({
  text: z.string()
    .optional()
    .describe("Text to display on the divider"),

  position: withMetadata(
    z.enum(["start", "center", "end"]).default("center").describe("Text position on divider"),
    { examples: ["start", "center", "end"], since: "1.0.0" },
  ),

  responsive: withMetadata(
    z.boolean().default(false).describe("Whether to use responsive behavior"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  vertical: withMetadata(
    z.boolean().default(false).describe("Whether to use vertical orientation"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete Divider Props Schema
export const DividerPropsSchema = BaseComponentPropsSchema
  .merge(DividerSpecificPropsSchema)
  .describe("Visual separator component with optional text");

// Infer TypeScript type from schema
export type DividerProps = z.infer<typeof DividerPropsSchema>;

// Export validation function
export const validateDividerProps = (props: unknown): DividerProps => {
  return DividerPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDividerProps = (props: unknown) => {
  return DividerPropsSchema.safeParse(props);
};
