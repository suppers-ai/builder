/**
 * Drawer Component Zod Schema
 * Defines props, types, validation, and documentation for the Drawer component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Drawer-specific props
const DrawerSpecificPropsSchema = z.object({
  side: withMetadata(
    z.enum(["left", "right"]).default("left").describe("Side where drawer appears"),
    { examples: ["left", "right"], since: "1.0.0" },
  ),

  open: withMetadata(
    z.boolean().default(false).describe("Whether the drawer is open"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  overlay: withMetadata(
    z.boolean().default(true).describe("Whether to show overlay when open"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  sidebarContent: z.any()
    .describe("Content to display in the sidebar"),

  children: z.any()
    .describe("Main content of the drawer"),

  onToggle: z.function()
    .args(z.boolean())
    .returns(z.void())
    .optional()
    .describe("Toggle handler for controlled mode"),

  onClose: z.function()
    .returns(z.void())
    .optional()
    .describe("Close event handler"),

  showControls: withMetadata(
    z.boolean().default(false).describe("Whether to show interactive controls"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  allowSideSwitch: withMetadata(
    z.boolean().default(false).describe("Allow switching drawer side"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  allowOverlayToggle: withMetadata(
    z.boolean().default(false).describe("Allow toggling overlay"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  showStatus: withMetadata(
    z.boolean().default(false).describe("Show drawer status information"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  controlsPosition: withMetadata(
    z.enum(["sidebar", "content"]).default("sidebar").describe("Position of control elements"),
    { examples: ["sidebar", "content"], since: "1.0.0" },
  ),
});

// Complete Drawer Props Schema
export const DrawerPropsSchema = BaseComponentPropsSchema
  .merge(DrawerSpecificPropsSchema)
  .describe("Side drawer/panel navigation component");

// Infer TypeScript type from schema
export type DrawerProps = z.infer<typeof DrawerPropsSchema>;

// Export validation function
export const validateDrawerProps = (props: unknown): DrawerProps => {
  return DrawerPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateDrawerProps = (props: unknown) => {
  return DrawerPropsSchema.safeParse(props);
};
