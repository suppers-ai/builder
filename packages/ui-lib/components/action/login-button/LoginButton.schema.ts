/**
 * LoginButton Component Zod Schema
 * Defines props, types, validation, and documentation for the LoginButton component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  DaisyUISizeSchema,
  DaisyUIVariantSchema,
  withMetadata,
} from "../../schemas/base.ts";

// LoginButton-specific props
const LoginButtonSpecificPropsSchema = z.object({
  variant: withMetadata(
    DaisyUIVariantSchema.default("primary").describe("Button visual style variant"),
    { examples: ["primary", "secondary", "ghost", "accent"], since: "1.0.0" },
  ),

  size: DaisyUISizeSchema.default("md").describe("Button size"),

  href: z.string()
    .optional()
    .describe("URL to navigate to on click"),

  onClick: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Click event handler"),

  loading: z.boolean()
    .default(false)
    .describe("Show loading state"),

  disabled: z.boolean()
    .default(false)
    .describe("Disable the button"),

  showIcon: withMetadata(
    z.boolean().default(true).describe("Show login icon"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete LoginButton Props Schema
export const LoginButtonPropsSchema = BaseComponentPropsSchema
  .merge(LoginButtonSpecificPropsSchema)
  .describe("Login button component with icon and customizable styling");

// Infer TypeScript type from schema
export type LoginButtonProps = z.infer<typeof LoginButtonPropsSchema>;

// Export validation function
export const validateLoginButtonProps = (props: unknown): LoginButtonProps => {
  return LoginButtonPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateLoginButtonProps = (props: unknown) => {
  return LoginButtonPropsSchema.safeParse(props);
};
