/**
 * Link Component Zod Schema
 * Defines props, types, validation, and documentation for the Link component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  ColorPropsSchema,
  LinkPropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Link-specific props
const LinkSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["default", "hover", "focus", "neutral"])
      .default("default")
      .describe("Link variant style"),
    { examples: ["default", "hover", "focus", "neutral"], since: "1.0.0" },
  ),

  underline: z.boolean()
    .default(false)
    .describe("Whether link is underlined"),

  external: withMetadata(
    z.boolean().default(false).describe("Whether link is external (opens in new tab)"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  disabled: z.boolean()
    .default(false)
    .describe("Whether link is disabled"),

  onClick: z.function()
    .args(z.custom<Event>())
    .returns(z.void())
    .optional()
    .describe("Custom click handler"),

  onNavigate: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Callback when navigation occurs"),

  className: z.string()
    .optional()
    .describe("Additional CSS classes"),
});

// Complete Link Props Schema
export const LinkComponentPropsSchema = BaseComponentPropsSchema
  .merge(LinkPropsSchema)
  .merge(ColorPropsSchema)
  .merge(LinkSpecificPropsSchema)
  .describe(
    "Styled navigation links with support for external links, custom styles, and interaction handlers",
  );

// Infer TypeScript type from schema
export type LinkComponentProps = z.infer<typeof LinkComponentPropsSchema>;

// Export validation function
export const validateLinkProps = (props: unknown): LinkComponentProps => {
  return LinkComponentPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateLinkProps = (props: unknown) => {
  return LinkComponentPropsSchema.safeParse(props);
};
