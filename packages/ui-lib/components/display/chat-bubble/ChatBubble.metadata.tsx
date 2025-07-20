import { ComponentMetadata } from "../../types.ts";
import { ChatBubble } from "./ChatBubble.tsx";

export const chatBubbleMetadata: ComponentMetadata = {
  name: "Chat Bubble",
  description: "Message conversation UI",
  category: "Data Display",
  path: "/components/display/chat-bubble",
  tags: ["message", "conversation", "chat", "bubble", "communication", "dialog"],
  examples: ["basic", "with-image", "with-header", "colors", "start-end"],
  relatedComponents: ["avatar", "card", "mockup"],
  preview: (
    <div class="flex flex-col gap-2 w-full max-w-sm">
      <ChatBubble
        message="Hello! How are you doing today?"
        name="Alice"
        time="12:45"
        position="start"
      />
      <ChatBubble
        message="I'm doing great, thanks for asking!"
        name="You"
        time="12:46"
        position="end"
        color="primary"
      />
    </div>
  ),
};
