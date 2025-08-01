/**
 * Card Component Zod Schema
 * Defines props, types, validation, and documentation for the Card component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Card-specific props
const CardSpecificPropsSchema = z.object({
  title: z.string()
    .optional()
    .describe("Card title"),

  image: z.string()
    .url()
    .optional()
    .describe("Card image URL"),

  imageAlt: z.string()
    .default("")
    .describe("Alt text for card image"),

  compact: withMetadata(
    z.boolean().default(false).describe("Use compact card layout"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  side: withMetadata(
    z.boolean().default(false).describe("Use side-by-side layout"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  glass: withMetadata(
    z.boolean().default(false).describe("Apply glass morphism effect (DaisyUI 5 compatible)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  bordered: z.boolean()
    .default(false)
    .describe("Show card border (DaisyUI 5 compatible)"),

  // DaisyUI 5 specific card features
  normal: withMetadata(
    z.boolean().default(false).describe("Use normal card styling (DaisyUI 5)"),
    { examples: ["true", "false"], since: "2.0.0" },
  ),

  actions: z.any()
    .optional()
    .describe("Card action buttons/content"),
});

// Complete Card Props Schema
export const CardPropsSchema = BaseComponentPropsSchema
  .merge(CardSpecificPropsSchema)
  .describe("Card component for displaying content with optional image, title, and actions");

// Infer TypeScript type from schema
export type CardProps = z.infer<typeof CardPropsSchema>;

// Export validation function
export const validateCardProps = (props: unknown): CardProps => {
  return CardPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateCardProps = (props: unknown) => {
  return CardPropsSchema.safeParse(props);
};
