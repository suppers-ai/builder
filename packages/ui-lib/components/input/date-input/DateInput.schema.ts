/**
 * DateInput Component Zod Schema
 * Defines props, types, validation, and documentation for the DateInput component
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

// DateInput-specific props
const DateInputSpecificPropsSchema = z.object({
  value: z.string()
    .optional()
    .describe("Current date value in YYYY-MM-DD format"),

  placeholder: z.string()
    .optional()
    .describe("Placeholder text for the input"),

  min: z.string()
    .optional()
    .describe("Minimum allowed date in YYYY-MM-DD format"),

  max: z.string()
    .optional()
    .describe("Maximum allowed date in YYYY-MM-DD format"),

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
});

// Complete DateInput Props Schema
export const DateInputPropsSchema = BaseComponentPropsSchema
  .merge(EventPropsSchema)
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(DisabledPropsSchema)
  .merge(DateInputSpecificPropsSchema)
  .describe("Date picker input component");

// Infer TypeScript type from schema
export type DateInputProps = z.infer<typeof DateInputPropsSchema>;

// Export validation function
export const validateDateInputProps = (props: unknown): DateInputProps => {
  return DateInputPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDateInputProps = (props: unknown) => {
  return DateInputPropsSchema.safeParse(props);
};
