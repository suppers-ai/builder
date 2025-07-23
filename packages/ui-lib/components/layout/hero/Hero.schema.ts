/**
 * Hero Component Zod Schema
 * Defines props, types, validation, and documentation for the Hero component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// CTA Button Schema
const CTAButtonSchema = z.object({
  text: z.string().describe("Button text"),
  href: z.string().optional().describe("Button link URL"),
  onClick: z.function().returns(z.void()).optional().describe("Button click handler"),
});

// Hero-specific props
const HeroSpecificPropsSchema = z.object({
  title: z.string()
    .describe("Hero title/heading"),

  subtitle: z.string()
    .optional()
    .describe("Hero subtitle/description"),

  primaryCTA: CTAButtonSchema
    .optional()
    .describe("Primary call-to-action button"),

  secondaryCTA: CTAButtonSchema
    .optional()
    .describe("Secondary call-to-action button"),

  content: z.any()
    .optional()
    .describe("Hero content (usually an image or illustration)"),

  variant: withMetadata(
    z.enum(["default", "centered", "split", "overlay", "minimal"]).default("default").describe(
      "Hero layout variant",
    ),
    { examples: ["default", "centered", "split", "overlay", "minimal"], since: "1.0.0" },
  ),

  background: withMetadata(
    z.enum(["default", "gradient", "image", "video"]).default("default").describe(
      "Background variant",
    ),
    { examples: ["default", "gradient", "image", "video"], since: "1.0.0" },
  ),

  backgroundImage: z.string()
    .optional()
    .describe("Background image URL"),

  backgroundVideo: z.string()
    .optional()
    .describe("Background video URL"),

  size: withMetadata(
    z.enum(["sm", "md", "lg", "full"]).default("lg").describe("Size variant"),
    { examples: ["sm", "md", "lg", "full"], since: "1.0.0" },
  ),

  align: withMetadata(
    z.enum(["left", "center", "right"]).default("center").describe("Content alignment"),
    { examples: ["left", "center", "right"], since: "1.0.0" },
  ),

  contentPosition: withMetadata(
    z.enum(["left", "right"]).default("right").describe("Content position for split layout"),
    { examples: ["left", "right"], since: "1.0.0" },
  ),

  onPrimaryCTAClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Primary CTA click handler"),

  onSecondaryCTAClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Secondary CTA click handler"),
});

// Complete Hero Props Schema
export const HeroPropsSchema = BaseComponentPropsSchema
  .merge(HeroSpecificPropsSchema)
  .describe("Hero banner component with title, CTA buttons, and background options");

// Export nested schemas for reuse
export { CTAButtonSchema };

// Infer TypeScript type from schema
export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type CTAButton = z.infer<typeof CTAButtonSchema>;

// Export validation function
export const validateHeroProps = (props: unknown): HeroProps => {
  return HeroPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateHeroProps = (props: unknown) => {
  return HeroPropsSchema.safeParse(props);
};
