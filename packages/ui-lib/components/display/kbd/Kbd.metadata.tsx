import { ComponentMetadata } from "../../types.ts";
import { Kbd } from "./Kbd.tsx";

export const kbdMetadata: ComponentMetadata = {
  name: "Kbd",
  description: "Keyboard key display",
  category: "Data Display",
  path: "/components/display/kbd",
  tags: ["keyboard", "key", "shortcut", "command", "hotkey", "keystroke"],
  examples: ["basic", "sizes", "in-text", "function-keys", "combinations"],
  relatedComponents: ["code", "badge", "tooltip"],
  preview: (
    <div class="flex gap-2 items-center">
      <Kbd>⌘</Kbd>
      <span>+</span>
      <Kbd>K</Kbd>
      <span class="ml-4">Press</span>
      <Kbd size="sm">Ctrl</Kbd>
      <span>+</span>
      <Kbd size="sm">C</Kbd>
    </div>
  ),
};
