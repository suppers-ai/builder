/**
 * Skeleton Component Zod Schema
 * Defines props, types, validation, and documentation for the Skeleton component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Skeleton-specific props
const SkeletonSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["text", "circular", "rectangular", "rounded"])
      .default("rectangular")
      .describe("Skeleton shape variant"),
    { examples: ["text", "circular", "rectangular", "rounded"], since: "1.0.0" },
  ),

  width: z.union([z.string(), z.number()])
    .optional()
    .describe("Skeleton width"),

  height: z.union([z.string(), z.number()])
    .optional()
    .describe("Skeleton height"),

  animated: withMetadata(
    z.boolean().default(true).describe("Enable skeleton animation"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  count: z.number()
    .positive()
    .default(1)
    .describe("Number of skeleton elements"),
});

// Complete Skeleton Props Schema
export const SkeletonPropsSchema = BaseComponentPropsSchema
  .merge(SkeletonSpecificPropsSchema)
  .describe("Skeleton loading placeholder component (DaisyUI 5 compatible)");

// Infer TypeScript type from schema
export type SkeletonProps = z.infer<typeof SkeletonPropsSchema>;

// Export validation function
export const validateSkeletonProps = (props: unknown): SkeletonProps => {
  return SkeletonPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateSkeletonProps = (props: unknown) => {
  return SkeletonPropsSchema.safeParse(props);
};
