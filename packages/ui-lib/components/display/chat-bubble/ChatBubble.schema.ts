/**
 * ChatBubble Component Zod Schema
 * Defines props, types, validation, and documentation for the ChatBubble component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, ColorPropsSchema, withMetadata } from "../../schemas/base.ts";

// ChatBubble-specific props
const ChatBubbleSpecificPropsSchema = z.object({
  variant: withMetadata(
    z.enum(["start", "end"]).default("start").describe("Chat bubble alignment"),
    { examples: ["start", "end"], since: "1.0.0" },
  ),

  avatar: z.string()
    .url()
    .optional()
    .describe("Avatar image URL"),

  username: z.string()
    .optional()
    .describe("Username/sender name"),

  timestamp: z.string()
    .optional()
    .describe("Message timestamp"),

  tail: withMetadata(
    z.boolean().default(true).describe("Show chat bubble tail"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),
});

// Complete ChatBubble Props Schema
export const ChatBubblePropsSchema = BaseComponentPropsSchema
  .merge(ColorPropsSchema)
  .merge(ChatBubbleSpecificPropsSchema)
  .describe("Chat bubble component for messaging interfaces");

// Infer TypeScript type from schema
export type ChatBubbleProps = z.infer<typeof ChatBubblePropsSchema>;

// Export validation function
export const validateChatBubbleProps = (props: unknown): ChatBubbleProps => {
  return ChatBubblePropsSchema.parse(props);
};

// Export safe validation function (returns result object)
export const safeValidateChatBubbleProps = (props: unknown) => {
  return ChatBubblePropsSchema.safeParse(props);
};
