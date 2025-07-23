/**
 * Textarea Component Zod Schema
 * Defines props, types, validation, and documentation for the Textarea component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Textarea-specific props
const TextareaSpecificPropsSchema = z.object({
  value: z.string()
    .optional()
    .describe("Current textarea value"),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the textarea"),

  rows: withMetadata(
    z.number().min(1).default(3).describe("Number of visible text rows"),
    { examples: ["3", "5", "10"], since: "1.0.0" },
  ),

  bordered: withMetadata(
    z.boolean().default(true).describe("Show textarea border"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style (transparent background)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Change event handler"),

  onInput: z.function()
    .args(z.any())
    .returns(z.void())
    .optional()
    .describe("Input event handler"),
});

// Complete Textarea Props Schema
export const TextareaPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(TextareaSpecificPropsSchema)
  .describe("Multi-line text input component");

// Infer TypeScript type from schema
export type TextareaProps = z.infer<typeof TextareaPropsSchema>;

// Export validation function
export const validateTextareaProps = (props: unknown): TextareaProps => {
  return TextareaPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateTextareaProps = (props: unknown) => {
  return TextareaPropsSchema.safeParse(props);
};
