/**
 * Collapse Component Zod Schema
 * Defines props, types, validation, and documentation for the Collapse component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Collapse-specific props
const CollapseSpecificPropsSchema = z.object({
  title: z.any().describe("Collapse title content"),

  open: z.boolean()
    .default(false)
    .describe("Whether collapse is open by default"),

  checkbox: withMetadata(
    z.boolean().default(false).describe("Use checkbox style toggle"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  arrow: withMetadata(
    z.boolean().default(false).describe("Show arrow indicator"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  plus: withMetadata(
    z.boolean().default(false).describe("Use plus/minus indicator"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  icon: z.any()
    .optional()
    .describe("Custom icon for toggle indicator"),

  isOpen: z.boolean()
    .optional()
    .describe("Controlled mode: current open state"),

  onToggle: z.function()
    .args(z.boolean())
    .returns(z.void())
    .optional()
    .describe("Callback when collapse is toggled"),

  showControls: z.boolean()
    .default(false)
    .describe("Show additional controls"),

  controlsPosition: z.enum(["top", "bottom"])
    .default("top")
    .describe("Position of controls"),

  allowStyleChange: z.boolean()
    .default(false)
    .describe("Allow changing collapse style"),

  allowCustomIcon: z.boolean()
    .default(false)
    .describe("Allow custom icon selection"),

  showStatus: z.boolean()
    .default(false)
    .describe("Show open/closed status"),
});

// Complete Collapse Props Schema
export const CollapsePropsSchema = BaseComponentPropsSchema
  .merge(CollapseSpecificPropsSchema)
  .describe("Collapsible content container with customizable indicators")
  .refine(
    (data) => [data.checkbox, data.arrow, data.plus].filter(Boolean).length <= 1,
    {
      message: "Only one indicator type can be active at a time",
      path: ["checkbox", "arrow", "plus"],
    },
  );

// Infer TypeScript type from schema
export type CollapseProps = z.infer<typeof CollapsePropsSchema>;

// Export validation function
export const validateCollapseProps = (props: unknown): CollapseProps => {
  return CollapsePropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateCollapseProps = (props: unknown) => {
  return CollapsePropsSchema.safeParse(props);
};
