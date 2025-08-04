import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const searchButtonExamples: ComponentExample[] = [
  {
    title: "Basic Search Button",
    description: "Simple search button with default styling",
    props: [
      {
        onClick: () => console.log("Search clicked"),
      },
      {
        onClick: () => console.log("Search clicked"),
        variant: "primary" as const,
      },
    ],
    interactive: true,
  },
  {
    title: "Search Button Variants",
    description: "Different visual styles for search buttons",
    props: [
      {
        onClick: () => {},
        variant: "ghost" as const,
      },
      {
        onClick: () => {},
        variant: "primary" as const,
      },
      {
        onClick: () => {},
        variant: "secondary" as const,
      },
      {
        onClick: () => {},
        variant: "outline" as const,
      },
    ],
    interactive: true,
  },
  {
    title: "Search Button Shapes",
    description: "Different shapes and sizes",
    props: [
      {
        onClick: () => {},
        shape: "square" as const,
        size: "sm" as const,
      },
      {
        onClick: () => {},
        shape: "circle" as const,
      },
      {
        onClick: () => {},
        shape: "square" as const,
        size: "lg" as const,
      },
    ],
    interactive: true,
  },
  {
    title: "Search with Keyboard Hint",
    description: "Search button with keyboard shortcut hint",
    props: [
      {
        onClick: () => {},
        showKeyboardHint: true,
        keyboardHint: "⌘K",
        children: "Search",
      },
      {
        onClick: () => {},
        showKeyboardHint: true,
        keyboardHint: "Ctrl+K",
        variant: "outline" as const,
        children: "Search",
      },
    ],
    interactive: true,
  },
  {
    title: "Search with Tooltip",
    description: "Search button with tooltip help",
    props: [
      {
        onClick: () => {},
        tooltip: "Search for anything",
      },
      {
        onClick: () => {},
        tooltip: "Open search modal (⌘K)",
        variant: "primary" as const,
      },
    ],
    interactive: true,
  },
];

const searchButtonProps: ComponentProp[] = [
  {
    name: "onClick",
    type: "() => void",
    description: "Function called when button is clicked",
    required: true,
  },
  {
    name: "variant",
    type:
      "'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'error'",
    description: "Visual style variant",
    default: "ghost",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Button size",
    default: "md",
  },
  {
    name: "shape",
    type: "'circle' | 'square'",
    description: "Button shape",
    default: "square",
  },
  {
    name: "showKeyboardHint",
    type: "boolean",
    description: "Show keyboard shortcut hint",
    default: "false",
  },
  {
    name: "keyboardHint",
    type: "string",
    description: "Keyboard shortcut text to display",
    default: "⌘K",
  },
  {
    name: "tooltip",
    type: "string",
    description: "Tooltip text on hover",
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Custom button content (overrides default icon)",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the button",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const searchButtonMetadata: ComponentMetadata = {
  name: "SearchButton",
  description:
    "Specialized button component for triggering search functionality with keyboard shortcuts",
  category: ComponentCategory.ACTION,
  path: "/components/action/search-button",
  tags: ["search", "find", "lookup", "keyboard", "shortcut"],
  relatedComponents: ["button", "search-modal", "kbd", "input"],
  interactive: true, // Always interactive - requires onClick handler
  preview: (
    <div class="flex gap-2 items-center">
      <button class="btn btn-ghost btn-square">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
      <button class="btn btn-outline">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Search
      </button>
    </div>
  ),
  examples: searchButtonExamples,
  props: searchButtonProps,
  variants: ["ghost", "primary", "secondary", "outline", "circle", "square"],
  useCases: ["Navigation bars", "Search interfaces", "Command palettes", "Toolbar actions"],
  usageNotes: [
    "Includes Search icon from Lucide by default",
    "onClick handler is required - this is always an interactive component",
    "Use showKeyboardHint to display keyboard shortcuts like ⌘K",
    "Keyboard hint is hidden on mobile for better UX",
    "Tooltip provides additional context on hover",
    "Ghost variant is default to blend with navigation bars",
    "Circle shape works well for icon-only buttons",
  ],
};
