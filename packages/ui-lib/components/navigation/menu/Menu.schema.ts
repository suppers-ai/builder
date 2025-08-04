/**
 * Menu Component Zod Schema
 * Defines props, types, validation, and documentation for the Menu component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// Recursive MenuItemProps schema
const MenuItemBaseSchema = z.object({
  label: z.string().describe("Menu item display label"),

  href: z.string()
    .optional()
    .describe("Optional link URL for navigation"),

  active: z.boolean()
    .default(false)
    .describe("Whether menu item is currently active"),

  disabled: z.boolean()
    .default(false)
    .describe("Whether menu item is disabled"),
});

// Create recursive schema for nested menu items
type MenuItemProps = z.infer<typeof MenuItemBaseSchema> & {
  children?: MenuItemProps[];
};

const MenuItemSchema: z.ZodType<MenuItemProps> = MenuItemBaseSchema.extend({
  children: z.lazy(() => z.array(MenuItemSchema))
    .optional()
    .describe("Optional nested menu items for submenus"),
});

// Menu-specific props
const MenuSpecificPropsSchema = z.object({
  horizontal: z.boolean()
    .default(false)
    .describe("Display menu horizontally instead of vertically"),

  compact: z.boolean()
    .default(false)
    .describe("Use compact spacing for menu items"),

  items: withMetadata(
    z.array(MenuItemSchema)
      .min(1)
      .describe("Array of menu items with optional nested structure"),
    {
      examples: [
        '[{ label: "Home", href: "/", active: true }, { label: "About", href: "/about" }]',
        '[{ label: "Products", children: [{ label: "Web Apps", href: "/web" }] }]',
      ],
      since: "1.0.0",
    },
  ),
});

// Complete Menu Props Schema
export const MenuPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(MenuSpecificPropsSchema)
  .describe(
    "Hierarchical navigation menu with support for nested items and horizontal/vertical layouts",
  );

// Export MenuItem schema for reuse
export { MenuItemSchema };

// Infer TypeScript types from schemas
export type MenuItemProps = z.infer<typeof MenuItemSchema>;
export type MenuProps = z.infer<typeof MenuPropsSchema>;

// Export validation functions
export const validateMenuProps = (props: unknown): MenuProps => {
  return MenuPropsSchema.parse(props);
};

export const safeValidateMenuProps = (props: unknown) => {
  return MenuPropsSchema.safeParse(props);
};

export const validateMenuItem = (item: unknown): MenuItemProps => {
  return MenuItemSchema.parse(item);
};

export const safeValidateMenuItem = (item: unknown) => {
  return MenuItemSchema.safeParse(item);
};
