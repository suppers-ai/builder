/**
 * AuthGuard Component Zod Schema
 * Defines props, types, validation, and documentation for the AuthGuard component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// AuthGuard-specific props
const AuthGuardSpecificPropsSchema = z.object({
  // Login button props
  loginButtonText: z.string()
    .default("Login")
    .describe("Text to display on the login button"),

  loginButtonVariant: withMetadata(
    z.enum([
      "primary",
      "secondary",
      "accent",
      "ghost",
      "link",
      "info",
      "success",
      "warning",
      "error",
    ])
      .default("primary")
      .describe("Variant style for the login button"),
    { examples: ["primary", "secondary", "accent"], since: "1.0.0" },
  ),

  loginButtonSize: withMetadata(
    z.enum(["xs", "sm", "md", "lg"]).default("md")
      .describe("Size of the login button"),
    { examples: ["xs", "sm", "md", "lg"], since: "1.0.0" },
  ),

  loginHref: z.string()
    .optional()
    .describe("URL to navigate to for login (if not using OAuth)"),

  onLogin: z.function()
    .optional()
    .describe("Custom login handler function"),

  // User info props
  dropdownItems: z.array(z.object({
    label: z.string().describe("Display text for the dropdown item"),
    onClick: z.function().describe("Callback function when the item is clicked"),
    icon: z.any().optional().describe("Optional icon component for the item"),
  }))
    .optional()
    .describe("Custom dropdown menu items for the user info settings menu"),

  // Layout props
  loadingComponent: z.any()
    .optional()
    .describe("Custom loading component to show while auth state is initializing"),

  // Custom render props
  renderLogin: z.function()
    .optional()
    .describe("Custom render function for login state. Receives login function as parameter."),

  renderUserInfo: z.function()
    .optional()
    .describe(
      "Custom render function for authenticated state. Receives user and logout function as parameters.",
    ),
});

// Complete AuthGuard Props Schema
export const AuthGuardPropsSchema = BaseComponentPropsSchema
  .merge(AuthGuardSpecificPropsSchema)
  .describe(
    "AuthGuard component that conditionally renders login or user info based on authentication state",
  );

// Infer TypeScript type from schema
export type AuthGuardProps = z.infer<typeof AuthGuardPropsSchema>;

// Export validation function
export const validateAuthGuardProps = (props: unknown): AuthGuardProps => {
  return AuthGuardPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateAuthGuardProps = (props: unknown) => {
  return AuthGuardPropsSchema.safeParse(props);
};
