/**
 * UserInfo Component Zod Schema
 * Defines props, types, validation, and documentation for the UserInfo component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// UserInfo-specific props
const UserInfoSpecificPropsSchema = z.object({
  user: z.any()
    .nullable()
    .optional()
    .describe("AuthUser object containing profile information"),

  dropdownItems: z.array(z.object({
    label: z.string().describe("Display text for the dropdown item"),
    onClick: z.function().describe("Callback function when the item is clicked"),
    icon: z.any().optional().describe("Optional icon component for the item")
  }))
    .default([])
    .describe("Array of dropdown menu items for the settings menu"),
});

// Complete UserInfo Props Schema
export const UserInfoPropsSchema = BaseComponentPropsSchema
  .merge(UserInfoSpecificPropsSchema)
  .describe("UserInfo component for displaying comprehensive user information with multiple layout variants");

// Infer TypeScript type from schema
export type UserInfoProps = z.infer<typeof UserInfoPropsSchema>;

// Export validation function
export const validateUserInfoProps = (props: unknown): UserInfoProps => {
  return UserInfoPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateUserInfoProps = (props: unknown) => {
  return UserInfoPropsSchema.safeParse(props);
};