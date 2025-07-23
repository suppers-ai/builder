/**
 * ComponentPreviewCard Component Zod Schema
 * Defines props, types, validation, and documentation for the ComponentPreviewCard component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../schemas/base.ts";

// ComponentPreviewCard-specific props
const ComponentPreviewCardSpecificPropsSchema = z.object({
  title: z.string().describe("Component preview title"),

  description: z.string()
    .optional()
    .describe("Component preview description"),

  component: z.any().describe("Component to preview"),

  code: z.string()
    .optional()
    .describe("Code example"),

  showCode: withMetadata(
    z.boolean().default(false).describe("Show code example"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  language: z.string()
    .default("tsx")
    .describe("Code syntax highlighting language"),

  category: z.string()
    .optional()
    .describe("Component category"),

  tags: z.array(z.string())
    .default([])
    .describe("Component tags"),

  interactive: z.boolean()
    .default(false)
    .describe("Whether component is interactive"),
});

// Complete ComponentPreviewCard Props Schema
export const ComponentPreviewCardPropsSchema = BaseComponentPropsSchema
  .merge(ComponentPreviewCardSpecificPropsSchema)
  .describe("Card for previewing UI components with code examples");

// Infer TypeScript type from schema
export type ComponentPreviewCardProps = z.infer<typeof ComponentPreviewCardPropsSchema>;

// Export validation function
export const validateComponentPreviewCardProps = (props: unknown): ComponentPreviewCardProps => {
  return ComponentPreviewCardPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateComponentPreviewCardProps = (props: unknown) => {
  return ComponentPreviewCardPropsSchema.safeParse(props);
};
