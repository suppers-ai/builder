import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { ChatBubble } from "./ChatBubble.tsx";

Deno.test("ChatBubble - basic rendering", () => {
  const html = renderToString(ChatBubble({
    message: "Hello world!",
  }));
  assertStringIncludes(html, "chat");
  assertStringIncludes(html, "Hello world!");
});

Deno.test("ChatBubble - start position", () => {
  const html = renderToString(ChatBubble({
    message: "Message from start",
    position: "start",
  }));
  assertStringIncludes(html, "chat-start");
});

Deno.test("ChatBubble - end position", () => {
  const html = renderToString(ChatBubble({
    message: "Message from end",
    position: "end",
  }));
  assertStringIncludes(html, "chat-end");
});

Deno.test("ChatBubble - with avatar", () => {
  const html = renderToString(ChatBubble({
    message: "Message with avatar",
    avatar: "/avatar.jpg",
  }));
  assertStringIncludes(html, "chat-image");
  assertStringIncludes(html, "/avatar.jpg");
});

Deno.test("ChatBubble - with name", () => {
  const html = renderToString(ChatBubble({
    message: "Message with name",
    name: "John Doe",
  }));
  assertStringIncludes(html, "chat-header");
  assertStringIncludes(html, "John Doe");
});

Deno.test("ChatBubble - with time", () => {
  const html = renderToString(ChatBubble({
    message: "Message with time",
    time: "12:45",
  }));
  assertStringIncludes(html, "chat-footer");
  assertStringIncludes(html, "12:45");
});

Deno.test("ChatBubble - with color", () => {
  const html = renderToString(ChatBubble({
    message: "Colored message",
    color: "primary",
  }));
  assertStringIncludes(html, "chat-bubble-primary");
});

Deno.test("ChatBubble - with custom class", () => {
  const html = renderToString(ChatBubble({
    message: "Custom chat",
    class: "custom-chat",
  }));
  assertStringIncludes(html, "custom-chat");
});

Deno.test("ChatBubble - HTML snapshot", async (t) => {
  const html = renderToString(ChatBubble({
    message: "Hello, how are you?",
    position: "start",
    avatar: "/user1.jpg",
    name: "Alice",
  }));
  await assertSnapshot(t, html);
});

Deno.test("ChatBubble - HTML snapshot end position", async (t) => {
  const html = renderToString(ChatBubble({
    message: "I'm doing great, thanks!",
    position: "end",
    avatar: "/user2.jpg",
    name: "Bob",
    time: "Read",
    color: "primary",
  }));
  await assertSnapshot(t, html);
});
