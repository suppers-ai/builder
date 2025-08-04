import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { ChatBubble } from "./ChatBubble.tsx";

const chatBubbleExamples: ComponentExample[] = [
  {
    title: "Basic Chat Bubble",
    description: "Simple chat message bubble",
    props: {
      message: "Hello! How can I help you today?",
      sender: "Assistant",
      timestamp: "2:30 PM",
    },
  },
  {
    title: "With User Avatar",
    description: "Chat bubble with user profile image",
    props: {
      message: "Hello! How can I help you today?",
      sender: "Assistant",
      timestamp: "2:30 PM",
    },
  },
  {
    title: "With Header Info",
    description: "Chat bubble with timestamp and user details",
    props: {
      message: "Hello! How can I help you today?",
      sender: "Assistant",
      timestamp: "2:30 PM",
    },
  },
  {
    title: "Different Colors",
    description: "Chat bubbles with various color themes for different message types",
    props: {
      message: "Hello! How can I help you today?",
      sender: "Assistant",
      timestamp: "2:30 PM",
      color: "primary",
    },
  },
  {
    title: "Start and End Positions",
    description: "Conversation flow with alternating message positions",
    props: {
      message: "Hello! How can I help you today?",
      sender: "Assistant",
      timestamp: "2:30 PM",
    },
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
