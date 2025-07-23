/**
 * Progress Component Zod Schema
 * Defines props, types, validation, and documentation for the Progress component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Progress-specific props
const ProgressSpecificPropsSchema = z.object({
  value: withMetadata(
    z.number().min(0).default(0).describe("Current progress value"),
    { examples: ["0", "50", "100"], since: "1.0.0" },
  ),

  max: z.number()
    .positive()
    .default(100)
    .describe("Maximum progress value"),

  indeterminate: withMetadata(
    z.boolean().default(false).describe("Show indeterminate progress animation"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  striped: z.boolean()
    .default(false)
    .describe("Show striped progress pattern"),

  animated: z.boolean()
    .default(false)
    .describe("Animate progress changes"),
});

// Complete Progress Props Schema
export const ProgressPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(ProgressSpecificPropsSchema)
  .describe("Progress bar component for showing completion status")
  .refine(
    (data) => !data.indeterminate || data.value === undefined,
    {
      message: "Indeterminate progress should not have a specific value",
      path: ["value", "indeterminate"],
    },
  );

// Infer TypeScript type from schema
export type ProgressProps = z.infer<typeof ProgressPropsSchema>;

// Export validation function
export const validateProgressProps = (props: unknown): ProgressProps => {
  return ProgressPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateProgressProps = (props: unknown) => {
  return ProgressPropsSchema.safeParse(props);
};
