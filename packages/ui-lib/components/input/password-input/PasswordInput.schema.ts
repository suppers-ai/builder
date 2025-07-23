/**
 * PasswordInput Component Zod Schema
 * Defines props, types, validation, and documentation for the PasswordInput component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  DisabledPropsSchema,
  EventPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// PasswordInput-specific props
const PasswordInputSpecificPropsSchema = z.object({
  value: z.string()
    .optional()
    .describe("Current password value"),

  placeholder: z.string()
    .default("••••••••")
    .describe("Placeholder text for the input"),

  bordered: withMetadata(
    z.boolean().default(true).describe("Show input border"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  ghost: withMetadata(
    z.boolean().default(false).describe("Ghost style (transparent background)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  required: withMetadata(
    z.boolean().default(false).describe("Whether the input is required"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  autoComplete: z.string()
    .default("current-password")
    .describe("Autocomplete attribute value"),

  showToggle: withMetadata(
    z.boolean().default(true).describe("Show password visibility toggle button"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Password change handler"),

  onVisibilityToggle: z.function()
    .args(z.boolean())
    .returns(z.void())
    .optional()
    .describe("Visibility toggle handler"),
});

// Complete PasswordInput Props Schema
export const PasswordInputPropsSchema = BaseComponentPropsSchema
  .merge(EventPropsSchema)
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(PasswordInputSpecificPropsSchema)
  .describe("Password input with visibility toggle");

// Infer TypeScript type from schema
export type PasswordInputProps = z.infer<typeof PasswordInputPropsSchema>;

// Export validation function
export const validatePasswordInputProps = (props: unknown): PasswordInputProps => {
  return PasswordInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidatePasswordInputProps = (props: unknown) => {
  return PasswordInputPropsSchema.safeParse(props);
};
