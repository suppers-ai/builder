/**
 * Loading Component Zod Schema
 * Defines props, types, validation, and documentation for the Loading component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Loading-specific props
const LoadingSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["spinner", "dots", "ring", "ball", "bars", "infinity"])
      .default("spinner")
      .describe("Loading animation variant"),
    { examples: ["spinner", "dots", "ring", "ball", "bars", "infinity"], since: "1.0.0" },
  ),

  text: z.string()
    .optional()
    .describe("Loading text to display"),

  overlay: z.boolean()
    .default(false)
    .describe("Show as overlay"),
});

// Complete Loading Props Schema
export const LoadingPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(LoadingSpecificPropsSchema)
  .describe("Loading indicator component with various animation styles");

// Infer TypeScript type from schema
export type LoadingProps = z.infer<typeof LoadingPropsSchema>;

// Export validation function
export const validateLoadingProps = (props: unknown): LoadingProps => {
  return LoadingPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateLoadingProps = (props: unknown) => {
  return LoadingPropsSchema.safeParse(props);
};
