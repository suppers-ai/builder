/**
 * Mask Component Zod Schema
 * Defines props, types, validation, and documentation for the Mask component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Mask-specific props
const MaskSpecificPropsSchema = z.object({
  children: z.any()
    .describe("Child content to display in the mask"),

  variant: withMetadata(
    z.enum([
      "squircle",
      "heart",
      "hexagon",
      "hexagon-2",
      "decagon",
      "pentagon",
      "diamond",
      "square",
      "circle",
      "parallelogram",
      "parallelogram-2",
      "parallelogram-3",
      "parallelogram-4",
      "star",
      "star-2",
      "triangle",
      "triangle-2",
      "triangle-3",
      "triangle-4",
    ]).default("squircle").describe("Mask shape variant"),
    {
      examples: ["squircle", "heart", "hexagon", "diamond", "square", "circle", "star", "triangle"],
      since: "1.0.0",
    },
  ),

  size: withMetadata(
    z.enum(["half", "full"]).optional().describe("Optional size modifier"),
    { examples: ["half", "full"], since: "1.0.0" },
  ),

  onMaskClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Click handler for the mask"),
});

// Complete Mask Props Schema
export const MaskPropsSchema = BaseComponentPropsSchema
  .merge(MaskSpecificPropsSchema)
  .describe("Content masking component with various shape options");

// Infer TypeScript type from schema
export type MaskProps = z.infer<typeof MaskPropsSchema>;

// Export validation function
export const validateMaskProps = (props: unknown): MaskProps => {
  return MaskPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateMaskProps = (props: unknown) => {
  return MaskPropsSchema.safeParse(props);
};
