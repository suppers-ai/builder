import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const kbdExamples: ComponentExample[] = [
  {
    title: "Basic Keyboard Keys",
    description: "Simple keyboard key representations",
    code: `<div class="flex gap-2 items-center">
  <Kbd>⌘</Kbd>
  <Kbd>⌥</Kbd>
  <Kbd>⇧</Kbd>
  <Kbd>⌃</Kbd>
</div>`,
    showCode: true,
  },
  {
    title: "Keyboard Sizes",
    description: "Different sizes for various contexts",
    code: `<div class="flex gap-2 items-center">
  <Kbd size="xs">⌘</Kbd>
  <Kbd size="sm">Ctrl</Kbd>
  <Kbd size="md">Shift</Kbd>
  <Kbd size="lg">Space</Kbd>
</div>`,
    showCode: true,
  },
  {
    title: "Key Combinations",
    description: "Showing keyboard shortcuts and combinations",
    code: `<div class="space-y-3">
  <div class="flex gap-2 items-center">
    <span class="text-sm">Copy:</span>
    <Kbd>⌘</Kbd>
    <span>+</span>
    <Kbd>C</Kbd>
  </div>
  
  <div class="flex gap-2 items-center">
    <span class="text-sm">Paste:</span>
    <Kbd>Ctrl</Kbd>
    <span>+</span>
    <Kbd>V</Kbd>
  </div>
  
  <div class="flex gap-2 items-center">
    <span class="text-sm">Select All:</span>
    <Kbd>Ctrl</Kbd>
    <span>+</span>
    <Kbd>A</Kbd>
  </div>
  
  <div class="flex gap-2 items-center">
    <span class="text-sm">Find:</span>
    <Kbd>Ctrl</Kbd>
    <span>+</span>
    <Kbd>Shift</Kbd>
    <span>+</span>
    <Kbd>F</Kbd>
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Function Keys",
    description: "Special function keys and longer key names",
    code: `<div class="flex gap-2 items-center flex-wrap">
  <Kbd>F1</Kbd>
  <Kbd>F5</Kbd>
  <Kbd>F12</Kbd>
  <Kbd>Esc</Kbd>
  <Kbd>Tab</Kbd>
  <Kbd>Enter</Kbd>
  <Kbd>Space</Kbd>
  <Kbd>Delete</Kbd>
</div>`,
    showCode: true,
  },
  {
    title: "Documentation Usage",
    description: "Keyboard shortcuts in help documentation and tooltips",
    code: `<div class="space-y-4">
  <div class="card bg-base-100 shadow-md">
    <div class="card-body">
      <h3 class="card-title">Keyboard Shortcuts</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span>New document</span>
          <div class="flex gap-1 items-center">
            <Kbd size="sm">⌘</Kbd>
            <span class="text-xs">+</span>
            <Kbd size="sm">N</Kbd>
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Open file</span>
          <div class="flex gap-1 items-center">
            <Kbd size="sm">⌘</Kbd>
            <span class="text-xs">+</span>
            <Kbd size="sm">O</Kbd>
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Save</span>
          <div class="flex gap-1 items-center">
            <Kbd size="sm">⌘</Kbd>
            <span class="text-xs">+</span>
            <Kbd size="sm">S</Kbd>
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Undo</span>
          <div class="flex gap-1 items-center">
            <Kbd size="sm">⌘</Kbd>
            <span class="text-xs">+</span>
            <Kbd size="sm">Z</Kbd>
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Quick search</span>
          <div class="flex gap-1 items-center">
            <Kbd size="sm">⌘</Kbd>
            <span class="text-xs">+</span>
            <Kbd size="sm">K</Kbd>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="text-sm text-base-content/70">
    Press <Kbd size="sm">?</Kbd> to show all keyboard shortcuts, or 
    <Kbd size="sm">Esc</Kbd> to close this dialog.
  </div>
</div>`,
    showCode: true,
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
  description: "Visual representation of keyboard keys and shortcuts for documentation and UI guides",
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
  useCases: ["Keyboard shortcuts", "Help documentation", "Tutorials", "Command references", "Accessibility guides"],
  usageNotes: [
    "Use consistent key representations (⌘ for Mac Command, Ctrl for Windows/Linux)",
    "Keep key labels short and recognizable",
    "Group related key combinations with appropriate spacing and separators",
    "Use smaller sizes for inline documentation and larger sizes for emphasis",
    "Consider platform differences when showing shortcuts (Mac vs PC keys)",
    "Combine with tooltips or help text to explain what shortcuts do",
  ],
};