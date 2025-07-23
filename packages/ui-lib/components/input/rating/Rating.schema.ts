/**
 * Rating Component Zod Schema
 * Defines props, types, validation, and documentation for the Rating component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// Rating-specific props
const RatingSpecificPropsSchema = z.object({
  value: withMetadata(
    z.number().min(0).default(0).describe("Current rating value"),
    { examples: ["0", "2.5", "4", "5"], since: "1.0.0" },
  ),

  max: withMetadata(
    z.number().min(1).default(5).describe("Maximum rating value"),
    { examples: ["5", "10", "3"], since: "1.0.0" },
  ),

  readonly: withMetadata(
    z.boolean().default(false).describe("Whether the rating is read-only"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  half: withMetadata(
    z.boolean().default(false).describe("Allow half-star ratings"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  mask: withMetadata(
    z.enum(["star", "star-2", "heart"]).default("star").describe("Shape of rating icons"),
    { examples: ["star", "star-2", "heart"], since: "1.0.0" },
  ),

  hoverValue: z.number()
    .optional()
    .describe("Current hover value for controlled mode"),

  onChange: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Rating change handler"),

  onHover: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Rating hover handler"),

  onMouseLeave: z.function()
    .returns(z.void())
    .optional()
    .describe("Mouse leave handler"),
});

// Complete Rating Props Schema
export const RatingPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(RatingSpecificPropsSchema)
  .describe("Interactive star rating component");

// Infer TypeScript type from schema
export type RatingProps = z.infer<typeof RatingPropsSchema>;

// Export validation function
export const validateRatingProps = (props: unknown): RatingProps => {
  return RatingPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateRatingProps = (props: unknown) => {
  return RatingPropsSchema.safeParse(props);
};
