/**
 * DatetimeInput Component Zod Schema
 * Defines props, types, validation, and documentation for the DatetimeInput component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// ISO datetime string pattern (YYYY-MM-DDTHH:MM)
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// DatetimeInput-specific props
const DatetimeInputSpecificPropsSchema = z.object({
  value: withMetadata(
    z.string()
      .regex(ISO_DATETIME_REGEX, "Invalid datetime format. Use YYYY-MM-DDTHH:MM")
      .optional()
      .describe("The datetime value in ISO format (YYYY-MM-DDTHH:MM)"),
    { examples: ["2024-01-15T14:30", "2024-12-31T23:59"], since: "1.0.0" },
  ),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the input"),

  min: withMetadata(
    z.string()
      .regex(ISO_DATETIME_REGEX, "Invalid min datetime format")
      .optional()
      .describe("Minimum allowed datetime in ISO format"),
    { examples: ["2024-01-01T00:00", "2024-01-15T09:00"], since: "1.0.0" },
  ),

  max: withMetadata(
    z.string()
      .regex(ISO_DATETIME_REGEX, "Invalid max datetime format")
      .optional()
      .describe("Maximum allowed datetime in ISO format"),
    { examples: ["2024-12-31T23:59", "2024-01-15T17:00"], since: "1.0.0" },
  ),

  step: z.string()
    .optional()
    .describe("Step value for datetime increments"),

  bordered: z.boolean()
    .default(true)
    .describe("Show input border"),

  ghost: z.boolean()
    .default(false)
    .describe("Ghost style input"),

  onChange: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Callback when datetime value changes"),

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

// Complete DatetimeInput Props Schema
export const DatetimeInputPropsSchema = InputBaseSchema
  .merge(DatetimeInputSpecificPropsSchema)
  .describe("DateTime input field for selecting both date and time with native browser controls");

// Infer TypeScript type from schema
export type DatetimeInputProps = z.infer<typeof DatetimeInputPropsSchema>;

// Export validation function
export const validateDatetimeInputProps = (props: unknown): DatetimeInputProps => {
  return DatetimeInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDatetimeInputProps = (props: unknown) => {
  return DatetimeInputPropsSchema.safeParse(props);
};
