import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Kbd } from "./Kbd.tsx";

const kbdExamples: ComponentExample[] = [
  {
    title: "Basic Keyboard Keys",
    description: "Simple keyboard key representations",
    props: {
      children: "Ctrl+C",
    },
  },
  {
    title: "Keyboard Sizes",
    description: "Different sizes for various contexts",
    props: {
      children: "Ctrl+C",
      size: "lg",
    },
  },
  {
    title: "Key Combinations",
    description: "Showing keyboard shortcuts and combinations",
    props: {
      children: "Ctrl+C",
    },
  },
  {
    title: "Function Keys",
    description: "Special function keys and longer key names",
    props: {
      children: "Ctrl+C",
    },
  },
  {
    title: "Documentation Usage",
    description: "Keyboard shortcuts in help documentation and tooltips",
    props: {
      children: "Ctrl+C",
    },
  },
];

const kbdProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "The key content to display (text, symbols, or icons)",
    required: true,
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
    description: "Size of the keyboard key",
    default: "md",
  },
  {
    name: "variant",
    type: "'default' | 'primary' | 'secondary' | 'accent' | 'ghost'",
    description: "Visual style variant",
    default: "default",
  },
  {
    name: "onClick",
    type: "() => void",
    description: "Click handler for interactive keys",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const kbdMetadata: ComponentMetadata = {
  name: "Kbd",
  description:
    "Visual representation of keyboard keys and shortcuts for documentation and UI guides",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/kbd",
  tags: ["keyboard", "key", "shortcut", "command", "hotkey", "keystroke"],
  relatedComponents: ["code", "badge", "tooltip"],
  interactive: false, // Display component, though can have onClick
  preview: (
    <div class="flex gap-2 items-center">
      <kbd class="kbd">⌘</kbd>
      <span>+</span>
      <kbd class="kbd">K</kbd>
      <span class="ml-4 text-sm">Press</span>
      <kbd class="kbd kbd-sm">Ctrl</kbd>
      <span>+</span>
      <kbd class="kbd kbd-sm">C</kbd>
    </div>
  ),
  examples: kbdExamples,
  props: kbdProps,
  variants: ["basic", "sizes", "combinations", "function-keys"],
  useCases: [
    "Keyboard shortcuts",
    "Help documentation",
    "Tutorials",
    "Command references",
    "Accessibility guides",
  ],
  usageNotes: [
    "Use consistent key representations (⌘ for Mac Command, Ctrl for Windows/Linux)",
    "Keep key labels short and recognizable",
    "Group related key combinations with appropriate spacing and separators",
    "Use smaller sizes for inline documentation and larger sizes for emphasis",
    "Consider platform differences when showing shortcuts (Mac vs PC keys)",
    "Combine with tooltips or help text to explain what shortcuts do",
  ],
};
