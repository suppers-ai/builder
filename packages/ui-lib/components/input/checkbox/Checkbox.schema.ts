/**
 * Checkbox Component Zod Schema
 * Defines props, types, validation, and documentation for the Checkbox component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Checkbox-specific props
const CheckboxSpecificPropsSchema = z.object({
  checked: withMetadata(
    z.boolean().optional().default(false).describe("Whether the checkbox is checked"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  indeterminate: withMetadata(
    z.boolean().optional().default(false).describe("Whether the checkbox is in indeterminate state"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  label: z.string()
    .optional()
    .describe("Label text to display next to checkbox"),

  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
});

// Complete Checkbox Props Schema
export const CheckboxPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(CheckboxSpecificPropsSchema)
  .describe("Interactive checkbox input component");

// Infer TypeScript type from schema
export type CheckboxProps = z.infer<typeof CheckboxPropsSchema>;

// Export validation function
export const validateCheckboxProps = (props: unknown): CheckboxProps => {
  return CheckboxPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateCheckboxProps = (props: unknown) => {
  return CheckboxPropsSchema.safeParse(props);
};
