/**
 * Dropdown Component Zod Schema
 * Defines props, types, validation, and documentation for the Dropdown component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Dropdown-specific props
const DropdownSpecificPropsSchema = z.object({
  open: z.boolean()
    .default(false)
    .describe("Whether dropdown is open"),

  trigger: z.any()
    .describe("Component that triggers the dropdown"),

  content: z.any()
    .describe("Content to display in the dropdown"),

  position: withMetadata(
    z.enum([
      "top",
      "bottom",
      "left",
      "right",
      "top-start",
      "top-end",
      "bottom-start",
      "bottom-end",
    ]).default("bottom").describe("Dropdown position relative to trigger"),
    { examples: ["bottom", "top", "bottom-end", "top-start"], since: "1.0.0" },
  ),

  hover: z.boolean()
    .default(false)
    .describe("Whether dropdown opens on hover"),

  forceOpen: z.boolean()
    .default(false)
    .describe("Force dropdown to stay open"),

  onToggle: z.function()
    .args(z.boolean())
    .returns(z.void())
    .optional()
    .describe("Callback when dropdown toggle state changes"),

  onOpen: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when dropdown opens"),

  onClose: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when dropdown closes"),
});

// Complete Dropdown Props Schema
export const DropdownPropsSchema = BaseComponentPropsSchema
  .merge(DropdownSpecificPropsSchema)
  .describe("Customizable dropdown menu with multiple positioning and trigger options");

// Infer TypeScript type from schema
export type DropdownProps = z.infer<typeof DropdownPropsSchema>;

// Export validation function
export const validateDropdownProps = (props: unknown): DropdownProps => {
  return DropdownPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDropdownProps = (props: unknown) => {
  return DropdownPropsSchema.safeParse(props);
};
