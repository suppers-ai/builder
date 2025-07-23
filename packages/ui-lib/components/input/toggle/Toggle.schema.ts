/**
 * Toggle Component Zod Schema
 * Defines props, types, validation, and documentation for the Toggle component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Toggle-specific props
const ToggleSpecificPropsSchema = z.object({
  checked: withMetadata(
    z.boolean().default(false).describe("Whether the toggle is checked"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
});

// Complete Toggle Props Schema
export const TogglePropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(ToggleSpecificPropsSchema)
  .describe("Toggle switch input component");

// Infer TypeScript type from schema
export type ToggleProps = z.infer<typeof TogglePropsSchema>;

// Export validation function
export const validateToggleProps = (props: unknown): ToggleProps => {
  return TogglePropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateToggleProps = (props: unknown) => {
  return TogglePropsSchema.safeParse(props);
};
