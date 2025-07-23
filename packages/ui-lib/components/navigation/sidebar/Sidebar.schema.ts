/**
 * Sidebar Component Zod Schema
 * Defines props, types, validation, and documentation for the Sidebar component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

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
  logo: z.any().optional().describe("Logo component"),
  showQuickLinks: z.boolean().optional().describe("Whether to show quick links section"),
  quickLinks: z.array(SidebarLinkSchema).optional().describe("Array of quick access links"),
  showSearch: z.boolean().optional().describe("Whether to show search input"),
  sections: z.array(SidebarSectionSchema).describe("Array of collapsible sections"),
});

// Sidebar-specific props
const SidebarSpecificPropsSchema = z.object({
  config: withMetadata(
    SidebarConfigSchema.describe("Configuration object defining sidebar structure and behavior"),
    { examples: ["{ title: 'My App', sections: [...] }"], since: "1.0.0" },
  ),

  currentPath: z.string()
    .default("")
    .describe("Current active path for highlighting active links"),

  onLinkClick: z.function()
    .args(SidebarLinkSchema)
    .returns(z.void())
    .optional()
    .describe("Callback when a sidebar link is clicked"),

  class: z.string()
    .optional()
    .describe("Additional CSS classes for the sidebar container"),
});

// Complete Sidebar Props Schema
export const SidebarPropsSchema = BaseComponentPropsSchema
  .merge(SidebarSpecificPropsSchema)
  .describe(
    "Configurable sidebar navigation with sections, quick links, search, and collapsible groups",
  );

// Export individual schemas for reuse
export { SidebarConfigSchema, SidebarLinkSchema, SidebarSectionSchema };

// Infer TypeScript types from schemas
export type SidebarLink = z.infer<typeof SidebarLinkSchema>;
export type SidebarSection = z.infer<typeof SidebarSectionSchema>;
export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;
export type SidebarProps = z.infer<typeof SidebarPropsSchema>;

// Export validation functions
export const validateSidebarProps = (props: unknown): SidebarProps => {
  return SidebarPropsSchema.parse(props);
};

export const safeValidateSidebarProps = (props: unknown) => {
  return SidebarPropsSchema.safeParse(props);
};

export const validateSidebarConfig = (config: unknown): SidebarConfig => {
  return SidebarConfigSchema.parse(config);
};

export const safeValidateSidebarConfig = (config: unknown) => {
  return SidebarConfigSchema.safeParse(config);
};
