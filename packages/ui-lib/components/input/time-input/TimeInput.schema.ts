/**
 * TimeInput Component Zod Schema
 * Defines props, types, validation, and documentation for the TimeInput component
 */

import { z } from "zod";
import { InputBaseSchema, withMetadata } from "../../schemas/base.ts";

// Time string pattern (HH:MM in 24-hour format)
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// TimeInput-specific props
const TimeInputSpecificPropsSchema = z.object({
  value: withMetadata(
    z.string()
      .regex(TIME_REGEX, "Invalid time format. Use HH:MM (24-hour format)")
      .optional()
      .describe("The time value in HH:MM format"),
    { examples: ["14:30", "09:00", "23:59"], since: "1.0.0" },
  ),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the input"),

  min: withMetadata(
    z.string()
      .regex(TIME_REGEX, "Invalid min time format")
      .optional()
      .describe("Minimum allowed time in HH:MM format"),
    { examples: ["09:00", "00:00", "08:30"], since: "1.0.0" },
  ),

  max: withMetadata(
    z.string()
      .regex(TIME_REGEX, "Invalid max time format")
      .optional()
      .describe("Maximum allowed time in HH:MM format"),
    { examples: ["17:00", "23:59", "18:30"], since: "1.0.0" },
  ),

  step: withMetadata(
    z.string()
      .optional()
      .describe("Step value for time increments (in minutes)"),
    { examples: ["15", "30", "60"], since: "1.0.0" },
  ),

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
    .describe("Callback when time value changes"),

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

// Complete TimeInput Props Schema
export const TimeInputPropsSchema = InputBaseSchema
  .merge(TimeInputSpecificPropsSchema)
  .describe("Time input field for selecting time with native browser controls");

// Infer TypeScript type from schema
export type TimeInputProps = z.infer<typeof TimeInputPropsSchema>;

// Export validation function
export const validateTimeInputProps = (props: unknown): TimeInputProps => {
  return TimeInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateTimeInputProps = (props: unknown) => {
  return TimeInputPropsSchema.safeParse(props);
};
