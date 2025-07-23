/**
 * Avatar Component Zod Schema
 * Defines props, types, validation, and documentation for the Avatar component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, SizePropsSchema, withMetadata } from "../../schemas/base.ts";

// Avatar-specific props
const AvatarSpecificPropsSchema = z.object({
  src: z.string()
    .url()
    .optional()
    .describe("Avatar image URL"),

  alt: z.string()
    .default("")
    .describe("Alt text for avatar image"),

  placeholder: z.string()
    .optional()
    .describe("Placeholder image URL or text"),

  ring: withMetadata(
    z.boolean().default(false).describe("Show ring border around avatar"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  online: withMetadata(
    z.boolean().default(false).describe("Show online status indicator"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  offline: withMetadata(
    z.boolean().default(false).describe("Show offline status indicator"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  initials: z.string()
    .max(3)
    .optional()
    .describe("Initials to display when no image is available"),
});

// Complete Avatar Props Schema
export const AvatarPropsSchema = BaseComponentPropsSchema
  .merge(SizePropsSchema)
  .merge(AvatarSpecificPropsSchema)
  .describe("Avatar component for displaying user profile images with status indicators")
  .refine(
    (data) => !(data.online && data.offline),
    { message: "Avatar cannot be both online and offline", path: ["online", "offline"] },
  );

// Infer TypeScript type from schema
export type AvatarProps = z.infer<typeof AvatarPropsSchema>;

// Export validation function
export const validateAvatarProps = (props: unknown): AvatarProps => {
  return AvatarPropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateAvatarProps = (props: unknown) => {
  return AvatarPropsSchema.safeParse(props);
};
