/**
 * ThemeController Component Zod Schema
 * Defines props, types, validation, and documentation for the ThemeController component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// ThemeController-specific props
const ThemeControllerSpecificPropsSchema = z.object({
  currentTheme: z.string()
    .default("light")
    .describe("Current active theme"),

  themes: withMetadata(
    z.array(z.string()).default(["light", "dark"]).describe("Available theme options"),
    { examples: ['["light", "dark", "cupcake", "cyberpunk"]'], since: "1.0.0" },
  ),

  variant: withMetadata(
    z.enum(["dropdown", "toggle", "radio"]).default("dropdown").describe(
      "Theme selector UI variant",
    ),
    { examples: ["dropdown", "toggle", "radio"], since: "1.0.0" },
  ),

  showLabel: z.boolean()
    .default(true)
    .describe("Show theme name labels"),

  showPreview: withMetadata(
    z.boolean().default(false).describe("Show theme color previews"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  enableTransitions: z.boolean()
    .default(true)
    .describe("Enable smooth theme transitions"),

  onThemeChange: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Callback when theme changes"),

  useGlobalState: withMetadata(
    z.boolean().default(false).describe("Use global theme state management"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  autoLoadSavedTheme: z.boolean()
    .default(false)
    .describe("Automatically load saved theme on mount"),

  autoSaveTheme: z.boolean()
    .default(false)
    .describe("Automatically save theme changes"),

  showControls: z.boolean()
    .default(false)
    .describe("Show additional theme controls"),

  allowManualThemeEntry: z.boolean()
    .default(false)
    .describe("Allow manual theme name entry"),
});

// Complete ThemeController Props Schema
export const ThemeControllerPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(ThemeControllerSpecificPropsSchema)
  .describe("Theme controller component for switching between application themes");

// Infer TypeScript type from schema
export type ThemeControllerProps = z.infer<typeof ThemeControllerPropsSchema>;

// Export validation function
export const validateThemeControllerProps = (props: unknown): ThemeControllerProps => {
  return ThemeControllerPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateThemeControllerProps = (props: unknown) => {
  return ThemeControllerPropsSchema.safeParse(props);
};
