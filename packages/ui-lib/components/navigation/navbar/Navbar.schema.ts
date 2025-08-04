/**
 * Navbar Component Zod Schema
 * Defines props, types, validation, and documentation for the Navbar component
 */

import { z } from "zod";
import { ComponentChildren } from "preact";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Navbar-specific props
const NavbarSpecificPropsSchema = z.object({
  start: withMetadata(
    z.custom<ComponentChildren>()
      .optional()
      .describe("Content for the start/left section of navbar"),
    { examples: ["<Logo />", "<MenuButton />"], since: "1.0.0" },
  ),

  center: z.custom<ComponentChildren>()
    .optional()
    .describe("Content for the center section of navbar"),

  end: z.custom<ComponentChildren>()
    .optional()
    .describe("Content for the end/right section of navbar"),
});

// Complete Navbar Props Schema
export const NavbarPropsSchema = BaseComponentPropsSchema
  .merge(NavbarSpecificPropsSchema)
  .describe("Responsive navigation bar with configurable start, center, and end sections");

// Infer TypeScript types from schemas
export type NavbarProps = z.infer<typeof NavbarPropsSchema>;

// Export validation functions
export const validateNavbarProps = (props: unknown): NavbarProps => {
  return NavbarPropsSchema.parse(props);
};

export const safeValidateNavbarProps = (props: unknown) => {
  return NavbarPropsSchema.safeParse(props);
};

// Utility validation function to ensure at least one section has content
export const validateNavbarContent = (props: {
  start?: ComponentChildren;
  center?: ComponentChildren;
  end?: ComponentChildren;
  children?: ComponentChildren;
}): boolean => {
  return Boolean(props.start || props.center || props.end || props.children);
};
