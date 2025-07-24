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
    code: `<div class="flex gap-2">
  <Button>Default</Button>
  <Button color="primary">Primary</Button>
  <Button color="secondary">Secondary</Button>
  <Button color="accent">Accent</Button>
</div>`,
    showCode: true,
  },
  {
    title: "Button Variants",
    description: "Different visual styles",
    code: `<div class="flex gap-2">
  <Button variant="outline" color="primary">Outline</Button>
  <Button variant="ghost" color="primary">Ghost</Button>
  <Button variant="link" color="primary">Link</Button>
</div>`,
    showCode: true,
  },
  {
    title: "Button Sizes",
    description: "Various sizes for different use cases",
    code: `<div class="flex items-center gap-2">
  <Button size="xs" color="primary">XS</Button>
  <Button size="sm" color="primary">SM</Button>
  <Button color="primary">MD</Button>
  <Button size="lg" color="primary">LG</Button>
</div>`,
    showCode: true,
  },
  {
    title: "Button States",
    description: "Different states and interactions",
    code: `<div class="flex gap-2">
  <Button color="primary">Normal</Button>
  <Button color="primary" active>Active</Button>
  <Button color="primary" disabled>Disabled</Button>
  <Button color="primary" loading>Loading</Button>
</div>`,
    showCode: true,
  },
  {
    title: "Interactive Buttons",
    description: "Buttons with click handlers",
    code: `<Button
  color="primary"
  onClick={() => alert("Clicked!")}
>
  Click Me
</Button>`,
    interactive: true,
    showCode: true,
  },
];

export const buttonMetadata: ComponentMetadata = {
  name: "Button",
  description: "Interactive buttons with multiple variants, sizes, and states for user actions",
  category: ComponentCategory.ACTION,
  path: "/components/action/button",
  tags: ["interactive", "action", "click"],
  relatedComponents: ["dropdown", "modal"],
  interactive: true, // Supports island mode with onClick handlers
  preview: (
    <div class="flex gap-2">
      <Button color="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
  examples: buttonExamples,
  schema: buttonSchema,
  variants: ["primary", "secondary", "accent", "ghost", "link", "outline"],
  useCases: ["Form submission", "Navigation", "Actions", "Loading states"],
  usageNotes: [
    "Use Button component for server-side rendered buttons without interactivity",
    "Use Button island for client-side interactive buttons with event handlers",
    "Primary buttons should be used sparingly for the main action on a page",
    "Outline buttons work well for secondary actions",
    "Ghost buttons are ideal for tertiary actions or navigation",
    "Loading state automatically disables the button to prevent multiple submissions",
  ],
};
