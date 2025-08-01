/**
 * Select Component Zod Schema
 * Defines props, types, validation, and documentation for the Select component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// SelectOption Schema
const SelectOptionSchema = z.object({
  value: z.string().describe("Option value"),
  label: z.string().describe("Option display label"),
  disabled: z.boolean().optional().describe("Whether option is disabled"),
});

// Select-specific props
const SelectSpecificPropsSchema = z.object({
  value: z.string()
    .optional()
    .describe("Selected value"),

  options: withMetadata(
    z.array(SelectOptionSchema).describe("Array of select options"),
    { examples: ['[{ value: "1", label: "Option 1" }]'], since: "1.0.0" },
  ),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the select"),

  bordered: z.boolean()
    .default(true)
    .describe("Show select border"),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style select (DaisyUI 5 compatible)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  // DaisyUI 5 specific select features
  filled: withMetadata(
    z.boolean().default(false).describe("Filled style select (DaisyUI 5)"),
    { examples: ["true", "false"], since: "2.0.0" },
  ),

  onChange: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
});

// Complete Select Props Schema
export const SelectPropsSchema = InputBaseSchema
  .merge(SelectSpecificPropsSchema)
  .describe("Select dropdown component for choosing from a list of options");

// Export SelectOption schema for reuse
export { SelectOptionSchema };

// Infer TypeScript types from schemas
export type SelectOption = z.infer<typeof SelectOptionSchema>;
export type SelectProps = Partial<z.infer<typeof SelectPropsSchema>> & {
  children?: any; // ComponentChildren from preact
  options: SelectOption[]; // Keep options as required
};

// Export validation functions
export const validateSelectProps = (props: unknown): SelectProps => {
  return SelectPropsSchema.parse(props);
};

export const safeValidateSelectProps = (props: unknown) => {
  return SelectPropsSchema.safeParse(props);
};

export const validateSelectOption = (option: unknown): SelectOption => {
  return SelectOptionSchema.parse(option);
};

export const safeValidateSelectOption = (option: unknown) => {
  return SelectOptionSchema.safeParse(option);
};
