/**
 * BrowserMockup Component Zod Schema
 * Defines props, types, validation, and documentation for the BrowserMockup component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// BrowserMockup-specific props
const BrowserMockupSpecificPropsSchema = z.object({
  children: z.any()
    .describe("Child content to display in the browser"),

  url: z.string()
    .default("https://example.com")
    .describe("Browser title/URL"),

  variant: withMetadata(
    z.enum(["default", "dark", "minimal"]).default("default").describe("Browser variant"),
    { examples: ["default", "dark", "minimal"], since: "1.0.0" },
  ),

  showControls: withMetadata(
    z.boolean().default(true).describe("Whether to show navigation buttons"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onMockupClick: z.function()
    .returns(z.void())
    .optional()
    .describe("Click handler for the mockup"),
});

// Complete BrowserMockup Props Schema
export const BrowserMockupPropsSchema = BaseComponentPropsSchema
  .merge(BrowserMockupSpecificPropsSchema)
  .describe("Browser window mockup component for showcasing web content");

// Infer TypeScript type from schema
export type BrowserMockupProps = z.infer<typeof BrowserMockupPropsSchema>;

// Export validation function
export const validateBrowserMockupProps = (props: unknown): BrowserMockupProps => {
  return BrowserMockupPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateBrowserMockupProps = (props: unknown) => {
  return BrowserMockupPropsSchema.safeParse(props);
};