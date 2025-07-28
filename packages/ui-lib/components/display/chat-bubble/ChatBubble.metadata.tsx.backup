import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { ChatBubble } from "./ChatBubble.tsx";

const chatBubbleExamples: ComponentExample[] = [
  {
    title: "Basic Chat Bubble",
    description: "Simple chat message bubble",
    code: `<ChatBubble message="Hello! How are you doing today?" name="Sarah" time="2:45 PM" />`,
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
    description: "Chat bubbles with various color themes for different message types",
    code: `<ChatBubble message="Meeting starts in 10 minutes!" color="primary" name="Assistant" time="9:50 AM" position="start" />
<ChatBubble message="Thanks for the reminder" color="secondary" name="You" time="9:51 AM" position="end" />
<ChatBubble message="File uploaded successfully ✅" color="success" name="System" time="9:52 AM" position="start" />`,
    showCode: true,
  },
  {
    title: "Start and End Positions",
    description: "Conversation flow with alternating message positions",
    code: `<div class="space-y-2">
  <ChatBubble 
    message="Hey, did you see the new design mockups?"
    position="start"
    name="Alice"
    time="12:45"
    avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  />
  <ChatBubble 
    message="Yes! They look amazing. I especially love the color scheme."
    position="end"
    name="You"
    time="12:46"
    color="primary"
  />
  <ChatBubble 
    message="Right? The gradient backgrounds really make it pop! 🎨"
    position="start"
    name="Alice"
    time="12:47"
    avatar="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  />
</div>`,
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
