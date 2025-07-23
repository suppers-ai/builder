/**
 * Carousel Component Zod Schema
 * Defines props, types, validation, and documentation for the Carousel component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// CarouselItem Schema
const CarouselItemSchema = z.object({
  children: z.any().describe("Carousel item content"),
});

// Carousel-specific props
const CarouselSpecificPropsSchema = z.object({
  vertical: withMetadata(
    z.boolean().default(false).describe("Vertical carousel orientation"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  autoSlide: withMetadata(
    z.boolean().default(false).describe("Enable automatic slide transitions"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  interval: z.number()
    .positive()
    .default(3000)
    .describe("Auto-slide interval in milliseconds"),

  indicators: z.boolean()
    .default(false)
    .describe("Show slide indicators"),

  navigation: z.boolean()
    .default(false)
    .describe("Show navigation arrows"),

  snap: withMetadata(
    z.enum(["start", "center", "end"]).default("center").describe("Slide snap alignment"),
    { examples: ["start", "center", "end"], since: "1.0.0" },
  ),

  currentSlide: z.number()
    .nonnegative()
    .optional()
    .describe("Controlled mode: current slide index"),

  onSlideChange: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when slide changes"),

  onNextSlide: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when next slide is requested"),

  onPrevSlide: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when previous slide is requested"),

  onGoToSlide: z.function()
    .args(z.number())
    .returns(z.void())
    .optional()
    .describe("Callback when specific slide is requested"),

  showControls: z.boolean()
    .default(false)
    .describe("Show additional controls"),

  controlsPosition: z.enum(["top", "bottom"])
    .default("bottom")
    .describe("Position of controls"),

  allowAutoSlideToggle: z.boolean()
    .default(false)
    .describe("Allow toggling auto-slide"),

  showSlideCounter: z.boolean()
    .default(false)
    .describe("Show current slide counter"),
});

// Complete Carousel Props Schema
export const CarouselPropsSchema = BaseComponentPropsSchema
  .merge(CarouselSpecificPropsSchema)
  .describe("Carousel component for displaying multiple items in a sliding interface");

// CarouselItem Props Schema
export const CarouselItemPropsSchema = BaseComponentPropsSchema
  .merge(CarouselItemSchema)
  .describe("Individual carousel item component");

// Infer TypeScript types from schemas
export type CarouselProps = z.infer<typeof CarouselPropsSchema>;
export type CarouselItemProps = z.infer<typeof CarouselItemPropsSchema>;

// Export validation functions
export const validateCarouselProps = (props: unknown): CarouselProps => {
  return CarouselPropsSchema.parse(props);
};

export const safeValidateCarouselProps = (props: unknown) => {
  return CarouselPropsSchema.safeParse(props);
};

export const validateCarouselItemProps = (props: unknown): CarouselItemProps => {
  return CarouselItemPropsSchema.parse(props);
};

export const safeValidateCarouselItemProps = (props: unknown) => {
  return CarouselItemPropsSchema.safeParse(props);
};
