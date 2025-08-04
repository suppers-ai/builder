/**
 * Input Component Zod Schema
 * Defines props, types, validation, and documentation for the Input component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// Input-specific props
const InputSpecificPropsSchema = z.object({
  type: withMetadata(
    z.enum([
      "text",
      "email",
      "password",
      "number",
      "date",
      "time",
      "datetime-local",
      "color",
      "tel",
      "url",
      "search",
    ]).default("text").describe("HTML input type attribute"),
    { examples: ["text", "email", "password", "number", "date", "time", "color"], since: "1.0.0" },
  ),

  placeholder: z.string()
    .default("")
    .describe("Placeholder text for the input"),

  value: z.union([z.string(), z.number()])
    .optional()
    .describe("Input value (string for text inputs, number for number inputs)"),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border (DaisyUI 5 compatible)"),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style input (DaisyUI 5 compatible)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  // DaisyUI 5 specific input features
  filled: withMetadata(
    z.boolean().default(false).describe("Filled style input (DaisyUI 5)"),
    { examples: ["true", "false"], since: "2.0.0" },
  ),

  // Number input specific props
  min: z.union([z.string(), z.number()])
    .optional()
    .describe("Minimum value (for number, date, time inputs)"),

  max: z.union([z.string(), z.number()])
    .optional()
    .describe("Maximum value (for number, date, time inputs)"),

  step: z.union([z.string(), z.number()])
    .optional()
    .describe("Step value (for number, time inputs)"),

  // Password input specific props
  showPasswordToggle: z.boolean()
    .default(false)
    .describe("Show password visibility toggle button (password type only)"),

  // Color input specific props
  showColorPreview: z.boolean()
    .default(true)
    .describe("Show color preview swatch (color type only)"),

  // Auto-complete attribute
  autoComplete: z.string()
    .optional()
    .describe("HTML autocomplete attribute"),
});

// Complete Input Props Schema
export const InputPropsSchema = InputBaseSchema
  .merge(InputSpecificPropsSchema)
  .partial() // Make all properties optional for better usability
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
