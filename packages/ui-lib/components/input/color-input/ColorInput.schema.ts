/**
 * ColorInput Component Zod Schema
 * Defines props, types, validation, and documentation for the ColorInput component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// ColorInput-specific props
const ColorInputSpecificPropsSchema = z.object({
  value: withMetadata(
    z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#000000").describe(
      "Color value in hex format (#rrggbb)",
    ),
    { examples: ["#3b82f6", "#ef4444", "#10b981"], since: "1.0.0" },
  ),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the input"),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border"),

  ghost: z.boolean()
    .default(false)
    .describe("Ghost style input"),

  showPreview: withMetadata(
    z.boolean().default(true).describe("Show color preview swatch"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onChange: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Callback when color value changes"),

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

// Complete ColorInput Props Schema
export const ColorInputPropsSchema = InputBaseSchema
  .merge(ColorInputSpecificPropsSchema)
  .describe("Color picker input field with preview swatch for selecting colors");

// Infer TypeScript type from schema
export type ColorInputProps = z.infer<typeof ColorInputPropsSchema>;

// Export validation function
export const validateColorInputProps = (props: unknown): ColorInputProps => {
  return ColorInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateColorInputProps = (props: unknown) => {
  return ColorInputPropsSchema.safeParse(props);
};
