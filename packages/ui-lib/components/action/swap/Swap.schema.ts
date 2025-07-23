/**
 * Swap Component Zod Schema
 * Defines props, types, validation, and documentation for the Swap component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Swap-specific props
const SwapSpecificPropsSchema = z.object({
  active: withMetadata(
    z.boolean().default(false).describe("Whether swap is in active state"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  rotate: withMetadata(
    z.boolean().default(false).describe("Apply rotation animation on swap"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  flip: withMetadata(
    z.boolean().default(false).describe("Apply flip animation on swap"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  on: z.any()
    .describe("Content to show when active"),

  off: z.any()
    .describe("Content to show when inactive"),

  onSwap: z.function()
    .args(z.boolean())
    .returns(z.void())
    .optional()
    .describe("Callback when swap state changes"),
});

// Complete Swap Props Schema
export const SwapPropsSchema = BaseComponentPropsSchema
  .merge(SwapSpecificPropsSchema)
  .describe("Interactive swap component that toggles between two states with animations");

// Infer TypeScript type from schema
export type SwapProps = z.infer<typeof SwapPropsSchema>;

// Export validation function
export const validateSwapProps = (props: unknown): SwapProps => {
  return SwapPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateSwapProps = (props: unknown) => {
  return SwapPropsSchema.safeParse(props);
};
