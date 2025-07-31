/**
 * Radio Component Zod Schema
 * Defines props, types, validation, and documentation for the Radio component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Radio-specific props
const RadioSpecificPropsSchema = z.object({
  name: z.string()
    .optional()
    .describe("Radio group name for form grouping"),

  value: z.string()
    .optional()
    .describe("Value of the radio button"),

  checked: withMetadata(
    z.boolean().optional().default(false).describe("Whether the radio button is selected"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  label: z.string()
    .optional()
    .describe("Label text to display next to radio button"),

  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),
});

// Complete Radio Props Schema
export const RadioPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(RadioSpecificPropsSchema)
  .describe("Radio button input component");

// Infer TypeScript type from schema
export type RadioProps = z.infer<typeof RadioPropsSchema>;

// Export validation function
export const validateRadioProps = (props: unknown): RadioProps => {
  return RadioPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateRadioProps = (props: unknown) => {
  return RadioPropsSchema.safeParse(props);
};
