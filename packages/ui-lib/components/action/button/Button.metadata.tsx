import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentSchema,
} from "../../types.ts";
import { Button } from "./Button.tsx";
import {
  ButtonPropsSchema,
  safeValidateButtonProps,
  validateButtonProps,
} from "./Button.schema.ts";

const buttonSchema: ComponentSchema = {
  schema: ButtonPropsSchema,
  validateFn: validateButtonProps,
  safeValidateFn: safeValidateButtonProps,
};

const buttonExamples: ComponentExample[] = [
  {
    title: "Basic Colors",
    description: "Standard button colors and variants",
    props: [
      { children: "Default" },
      { color: "primary", children: "Primary" },
      { color: "secondary", children: "Secondary" },
      { color: "accent", children: "Accent" },
    ],
  },
  {
    title: "Button Variants",
    description: "Different visual styles",
    props: [
      { variant: "outline", color: "primary", children: "Outline" },
      { variant: "ghost", color: "primary", children: "Ghost" },
      { variant: "link", color: "primary", children: "Link" },
    ],
  },
  {
    title: "Button Sizes",
    description: "Various sizes for different use cases",
    props: [
      { size: "xs", color: "primary", children: "XS" },
      { size: "sm", color: "primary", children: "SM" },
      { color: "primary", children: "MD" },
      { size: "lg", color: "primary", children: "LG" },
    ],
  },
  {
    title: "Button States",
    description: "Different states and interactions",
    props: [
      { color: "primary", children: "Normal" },
      { color: "primary", active: true, children: "Active" },
      { color: "primary", disabled: true, children: "Disabled" },
      { color: "primary", loading: true, children: "Loading" },
    ],
  },
];

export const buttonMetadata: ComponentMetadata = {
  name: "Button",
  description:
    "Interactive buttons with multiple variants, sizes, and states for user actions, fully compatible with DaisyUI 5 and Tailwind 4",
  category: ComponentCategory.ACTION,
  path: "/components/action/button",
  tags: [
    "interactive",
    "action",
    "click",
    "daisyui-5",
    "tailwind-4",
    "enhanced-loading",
    "accessibility",
  ],
  relatedComponents: ["dropdown", "modal"],
  interactive: true, // Supports island mode with onClick handlers
  preview: (
    <div class="flex gap-2">
      <Button color="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button loading>Loading</Button>
    </div>
  ),
  examples: buttonExamples,
  schema: buttonSchema,
  variants: ["primary", "secondary", "accent", "ghost", "link", "outline", "neutral"],
  useCases: ["Form submission", "Navigation", "Actions", "Loading states", "Interactive elements"],
  usageNotes: [
    "Use Button component for server-side rendered buttons without interactivity",
    "Use Button island for client-side interactive buttons with event handlers",
    "Primary buttons should be used sparingly for the main action on a page",
    "Outline buttons work well for secondary actions",
    "Ghost buttons are ideal for tertiary actions or navigation",
    "Loading state automatically disables the button to prevent multiple submissions",
    "Enhanced loading spinner patterns with DaisyUI 5: supports spinner, dots, ring, and ball types",
    "Improved hover states and animations with smoother transitions",
    "Better accessibility with enhanced focus rings and ARIA support",
    "Enhanced color system with better semantic tokens and contrast ratios",
    "Supports Tailwind 4 arbitrary values for custom styling: bg-[#custom], text-[14px]",
    "Optimized performance with better CSS generation and tree-shaking",
    "Fully backward compatible - all existing usage patterns continue to work",
    "Respects user's prefers-reduced-motion settings for animations",
  ],
};
