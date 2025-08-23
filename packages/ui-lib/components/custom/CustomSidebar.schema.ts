/**
 * CustomSidebar Component Schema
 * Defines props, types, validation, and documentation for the CustomSidebar component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../schemas/base.ts";

// Sidebar Link Schema
const SidebarLinkSchema = z.object({
  name: z.string().describe("Link display name"),
  path: z.string().describe("Link URL path"),
  icon: z.any().optional().describe("Icon component"),
  badge: z.string().optional().describe("Badge text"),
  external: z.boolean().optional().describe("Whether link is external"),
});

// Sidebar Section Schema
const SidebarSectionSchema = z.object({
  id: z.string().describe("Unique section identifier"),
  title: z.string().describe("Section display title"),
  icon: z.any().optional().describe("Section icon component"),
  badge: z.string().optional().describe("Section badge text"),
  defaultOpen: z.boolean().optional().describe("Whether section is open by default"),
  links: z.array(SidebarLinkSchema).describe("Array of links in this section"),
});

// Sidebar Configuration Schema
const SidebarConfigSchema = z.object({
  title: z.string().optional().describe("Sidebar header title"),
  quickLinks: z.array(SidebarLinkSchema).optional().describe("Array of quick access links"),
  sections: z.array(SidebarSectionSchema).describe("Array of collapsible sections"),
});

// CustomSidebar-specific props
const CustomSidebarSpecificPropsSchema = z.object({
  config: withMetadata(
    SidebarConfigSchema.describe("Configuration object defining sidebar structure and behavior"),
    { examples: ["{ title: 'My App', sections: [...] }"], since: "1.0.0" },
  ),

  currentPath: z.string()
    .default("")
    .describe("Current active path for highlighting active links"),

  authComponent: z.any()
    .optional()
    .describe("Authentication component to display at bottom of sidebar"),

  onLinkClick: z.function()
    .args(z.string())
    .returns(z.void())
    .optional()
    .describe("Callback when a sidebar link is clicked with path"),

  logoProps: z.object({
    href: z.string().optional(),
    alt: z.string().optional(),
    variant: z.enum(["short", "long"]).optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
  }).optional().describe("Logo component props"),

  class: z.string()
    .optional()
    .describe("Additional CSS classes for the sidebar container"),
});

// Complete CustomSidebar Props Schema
export const CustomSidebarPropsSchema = BaseComponentPropsSchema
  .merge(CustomSidebarSpecificPropsSchema)
  .describe(
    "Advanced configurable sidebar navigation with mobile overlay, sections, quick links, and authentication",
  );

// Export individual schemas for reuse
export { SidebarConfigSchema, SidebarLinkSchema, SidebarSectionSchema };

// Infer TypeScript types from schemas
export type SidebarLink = z.infer<typeof SidebarLinkSchema>;
export type SidebarSection = z.infer<typeof SidebarSectionSchema>;
export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;
export type CustomSidebarProps = z.infer<typeof CustomSidebarSpecificPropsSchema>;

// Export validation functions
export const validateCustomSidebarProps = (props: unknown) => {
  return CustomSidebarPropsSchema.parse(props);
};

export const safeValidateCustomSidebarProps = (props: unknown) => {
  return CustomSidebarPropsSchema.safeParse(props);
};

export const validateSidebarConfig = (config: unknown): SidebarConfig => {
  return SidebarConfigSchema.parse(config);
};

export const safeValidateSidebarConfig = (config: unknown) => {
  return SidebarConfigSchema.safeParse(config);
};
