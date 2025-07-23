/**
 * EmailInput Component Zod Schema
 * Defines props, types, validation, and documentation for the EmailInput component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// EmailInput-specific props
const EmailInputSpecificPropsSchema = z.object({
  value: z.string()
    .email("Invalid email format")
    .optional()
    .describe("The email input value"),

  placeholder: withMetadata(
    z.string().default("your@email.com").describe("Placeholder text for the input"),
    { examples: ["your@email.com", "Enter email address"], since: "1.0.0" },
  ),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border"),

  ghost: z.boolean()
    .default(false)
    .describe("Ghost style input"),

  autoComplete: z.string()
    .default("email")
    .describe("Autocomplete attribute value"),

  onChange: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Callback when email value changes"),

  onValidationChange: withMetadata(
    z.function()
      .args(z.boolean())
      .returns(z.void())
      .optional()
      .describe("Callback when email validation state changes"),
    { examples: ["(isValid) => console.log(isValid)"], since: "1.0.0" },
  ),

  onFocus: z.function()
    .args(z.custom<FocusEvent>())
    .returns(z.void())
    .optional()
    .describe("Focus event handler"),

  onBlur: z.function()
    .args(z.custom<FocusEvent>())
    .returns(z.void())
    .optional()
    .describe("Blur event handler"),

  onInput: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Input event handler"),
});

// Complete EmailInput Props Schema
export const EmailInputPropsSchema = InputBaseSchema
  .merge(EmailInputSpecificPropsSchema)
  .describe("Email input field with built-in validation and appropriate mobile keyboard");

// Infer TypeScript type from schema
export type EmailInputProps = z.infer<typeof EmailInputPropsSchema>;

// Export validation function
export const validateEmailInputProps = (props: unknown): EmailInputProps => {
  return EmailInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateEmailInputProps = (props: unknown) => {
  return EmailInputPropsSchema.safeParse(props);
};
