/**
 * SearchButton Component Zod Schema
 * Defines props, types, validation, and documentation for the SearchButton component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  DaisyUISizeSchema,
  DaisyUIVariantSchema,
  withMetadata,
} from "../../schemas/base.ts";

// SearchButton-specific props
const SearchButtonSpecificPropsSchema = z.object({
  onClick: z.function()
    .args()
    .returns(z.void())
    .describe("Click event handler (required)"),

  variant: withMetadata(
    DaisyUIVariantSchema.default("ghost").describe("Button visual style variant"),
    { examples: ["ghost", "primary", "secondary", "accent"], since: "1.0.0" },
  ),

  size: DaisyUISizeSchema.default("md").describe("Button size"),

  shape: z.enum(["circle", "square"])
    .optional()
    .describe("Button shape"),

  showKeyboardHint: withMetadata(
    z.boolean().default(false).describe("Show keyboard shortcut hint"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  keyboardHint: z.string()
    .default("⌘K")
    .describe("Keyboard shortcut text to display"),

  tooltip: z.string()
    .optional()
    .describe("Tooltip text"),

  disabled: z.boolean()
    .default(false)
    .describe("Disable the button"),
});

// Complete SearchButton Props Schema
export const SearchButtonPropsSchema = BaseComponentPropsSchema
  .merge(SearchButtonSpecificPropsSchema)
  .describe("Search button component with keyboard hint and tooltip support");

// Infer TypeScript type from schema
export type SearchButtonProps = z.infer<typeof SearchButtonPropsSchema>;

// Export validation function
export const validateSearchButtonProps = (props: unknown): SearchButtonProps => {
  return SearchButtonPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateSearchButtonProps = (props: unknown) => {
  return SearchButtonPropsSchema.safeParse(props);
};
