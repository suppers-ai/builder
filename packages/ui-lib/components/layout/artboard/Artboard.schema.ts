/**
 * Artboard Component Zod Schema
 * Defines props, types, validation, and documentation for the Artboard component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Artboard-specific props
const ArtboardSpecificPropsSchema = z.object({
  children: z.any()
    .describe("Child content to display in the artboard"),

  size: withMetadata(
    z.enum(["1", "2", "3", "4", "5", "6"]).default("1").describe("Artboard size"),
    { examples: ["1", "2", "3", "4", "5", "6"], since: "1.0.0" },
  ),

  horizontal: withMetadata(
    z.boolean().default(false).describe("Whether to use horizontal orientation"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  phone: withMetadata(
    z.boolean().default(false).describe("Whether to use phone mockup sizing"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  demo: withMetadata(
    z.boolean().default(false).describe("Whether to use demo styling"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onArtboardClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Click handler for the artboard"),
});

// Complete Artboard Props Schema
export const ArtboardPropsSchema = BaseComponentPropsSchema
  .merge(ArtboardSpecificPropsSchema)
  .describe("Device mockup frame component for showcasing content");

// Infer TypeScript type from schema
export type ArtboardProps = z.infer<typeof ArtboardPropsSchema>;

// Export validation function
export const validateArtboardProps = (props: unknown): ArtboardProps => {
  return ArtboardPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateArtboardProps = (props: unknown) => {
  return ArtboardPropsSchema.safeParse(props);
};
