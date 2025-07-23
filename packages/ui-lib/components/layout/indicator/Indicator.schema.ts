/**
 * Indicator Component Zod Schema
 * Defines props, types, validation, and documentation for the Indicator component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Indicator-specific props
const IndicatorSpecificPropsSchema = z.object({
  content: z.union([z.string(), z.number(), z.any()])
    .optional()
    .describe("Content to display inside the indicator"),

  children: z.any()
    .describe("Child element that the indicator will be positioned relative to"),

  position: withMetadata(
    z.enum([
      "top-start",
      "top-center",
      "top-end",
      "middle-start",
      "middle-center",
      "middle-end",
      "bottom-start",
      "bottom-center",
      "bottom-end",
    ]).default("top-end").describe("Position of the indicator relative to the child element"),
    {
      examples: [
        "top-start",
        "top-center",
        "top-end",
        "middle-start",
        "middle-center",
        "middle-end",
        "bottom-start",
        "bottom-center",
        "bottom-end",
      ],
      since: "1.0.0",
    },
  ),

  color: withMetadata(
    z.enum(["primary", "secondary", "accent", "neutral", "info", "success", "warning", "error"])
      .default("primary").describe("Color variant of the indicator"),
    {
      examples: [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "info",
        "success",
        "warning",
        "error",
      ],
      since: "1.0.0",
    },
  ),

  size: withMetadata(
    z.enum(["xs", "sm", "md", "lg"]).default("md").describe("Size of the indicator"),
    { examples: ["xs", "sm", "md", "lg"], since: "1.0.0" },
  ),

  variant: withMetadata(
    z.enum(["badge", "dot", "ping", "pulse"]).default("badge").describe(
      "Visual variant of the indicator",
    ),
    { examples: ["badge", "dot", "ping", "pulse"], since: "1.0.0" },
  ),

  offset: withMetadata(
    z.boolean().default(false).describe("Whether to offset the indicator from the edge"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onIndicatorClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Click handler for the indicator"),

  visible: withMetadata(
    z.boolean().default(true).describe("Whether the indicator is visible"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete Indicator Props Schema
export const IndicatorPropsSchema = BaseComponentPropsSchema
  .merge(IndicatorSpecificPropsSchema)
  .describe("Position indicator/badge overlay component");

// Infer TypeScript type from schema
export type IndicatorProps = z.infer<typeof IndicatorPropsSchema>;

// Export validation function
export const validateIndicatorProps = (props: unknown): IndicatorProps => {
  return IndicatorPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateIndicatorProps = (props: unknown) => {
  return IndicatorPropsSchema.safeParse(props);
};
