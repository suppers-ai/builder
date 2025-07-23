/**
 * RadialProgress Component Zod Schema
 * Defines props, types, validation, and documentation for the RadialProgress component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  SizePropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// RadialProgress-specific props
const RadialProgressSpecificPropsSchema = z.object({
  value: withMetadata(
    z.number().min(0).max(100).describe("Progress value (0-100)"),
    { examples: ["0", "25", "50", "75", "100"], since: "1.0.0" },
  ),

  thickness: z.number()
    .min(1)
    .max(20)
    .default(4)
    .describe("Progress ring thickness"),

  showText: withMetadata(
    z.boolean().default(true).describe("Show progress percentage text"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  customText: z.string()
    .optional()
    .describe("Custom text to display instead of percentage"),

  animated: z.boolean()
    .default(false)
    .describe("Enable progress animation"),

  duration: z.number()
    .positive()
    .default(1000)
    .describe("Animation duration in milliseconds"),
});

// Complete RadialProgress Props Schema
export const RadialProgressPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ColorPropsSchema)
  .merge(RadialProgressSpecificPropsSchema)
  .describe("Circular progress indicator component");

// Infer TypeScript type from schema
export type RadialProgressProps = z.infer<typeof RadialProgressPropsSchema>;

// Export validation function
export const validateRadialProgressProps = (props: unknown): RadialProgressProps => {
  return RadialProgressPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateRadialProgressProps = (props: unknown) => {
  return RadialProgressPropsSchema.safeParse(props);
};
