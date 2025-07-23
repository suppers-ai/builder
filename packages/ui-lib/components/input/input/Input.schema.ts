/**
 * Input Component Zod Schema
 * Defines props, types, validation, and documentation for the Input component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// Input-specific props
const InputSpecificPropsSchema = z.object({
  type: withMetadata(
    z.string().default("text").describe("HTML input type attribute"),
    { examples: ["text", "email", "password", "number", "tel"], since: "1.0.0" },
  ),

  placeholder: z.string()
    .default("")
    .describe("Placeholder text for the input"),

  value: z.string()
    .default("")
    .describe("Input value"),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border"),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style input"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete Input Props Schema
export const InputPropsSchema = InputBaseSchema
  .merge(InputSpecificPropsSchema)
  .describe("Text input fields for capturing user input with various styles and states");

// Infer TypeScript type from schema
export type InputProps = z.infer<typeof InputPropsSchema>;

// Export validation function
export const validateInputProps = (props: unknown): InputProps => {
  return InputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateInputProps = (props: unknown) => {
  return InputPropsSchema.safeParse(props);
};
