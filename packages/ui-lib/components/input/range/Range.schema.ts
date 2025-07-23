/**
 * Range Component Zod Schema
 * Defines props, types, validation, and documentation for the Range component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Range-specific props
const RangeSpecificPropsSchema = z.object({
  min: withMetadata(
    z.number().default(0).describe("Minimum value for the range"),
    { examples: ["0", "-100", "1"], since: "1.0.0" },
  ),

  max: withMetadata(
    z.number().default(100).describe("Maximum value for the range"),
    { examples: ["100", "200", "10"], since: "1.0.0" },
  ),

  value: withMetadata(
    z.number().default(50).describe("Current value of the range"),
    { examples: ["0", "25", "50", "75", "100"], since: "1.0.0" },
  ),

  step: withMetadata(
    z.number().default(1).describe("Step increment for the range"),
    { examples: ["1", "0.1", "5", "10"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
});

// Complete Range Props Schema
export const RangePropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(RangeSpecificPropsSchema)
  .describe("Range slider input component");

// Infer TypeScript type from schema
export type RangeProps = z.infer<typeof RangePropsSchema>;

// Export validation function
export const validateRangeProps = (props: unknown): RangeProps => {
  return RangePropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateRangeProps = (props: unknown) => {
  return RangePropsSchema.safeParse(props);
};
