import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { ChatBubble } from "./ChatBubble.tsx";

const chatBubbleExamples: ComponentExample[] = [
  {
    title: "Basic Chat Bubble",
    description: "Simple chat message bubble",
    code: `<ChatBubble message="Hello! How are you doing today?" />`,
    showCode: true,
  },
  {
    title: "With User Avatar",
    description: "Chat bubble with user profile image",
    code: `<ChatBubble 
  message="I'm doing great, thanks for asking!"
  name="Sarah"
  time="2:30 PM"
  avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
/>`,
    showCode: true,
  },
  {
    title: "With Header Info",
    description: "Chat bubble with timestamp and user details",
    code: `<ChatBubble 
  message="Just finished the new design mockups!"
  name="Alex Johnson"
  time="Yesterday at 4:15 PM"
  position="start"
/>`,
    showCode: true,
  },
  {
    title: "Different Colors",
    description: "Chat bubbles with various color themes",
    code: `<ChatBubble message="This is a primary message" color="primary" name="User" />
<ChatBubble message="This is a secondary message" color="secondary" name="User" />
<ChatBubble message="This is an accent message" color="accent" name="User" />`,
    showCode: true,
  },
  {
    title: "Start and End Positions",
    description: "Chat bubbles aligned to different sides",
    code: `<ChatBubble 
  message="Message from the start (left side)"
  position="start"
  name="Alice"
  time="12:45"
/>
<ChatBubble 
  message="Message from the end (right side)"
  position="end"
  name="You"
  time="12:46"
  color="primary"
/>`,
    showCode: true,
  },
];

export const chatBubbleMetadata: ComponentMetadata = {
  name: "Chat Bubble",
  description: "Message conversation UI",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/chat-bubble",
  tags: ["message", "conversation", "chat", "bubble", "communication", "dialog"],
  examples: chatBubbleExamples,
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
