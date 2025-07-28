import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentSchema
} from "../../types.ts";
import { Button } from "./Button.tsx";
import {
  ButtonPropsSchema,
  safeValidateButtonProps,
  validateButtonProps
} from "./Button.schema.ts";

const buttonSchema: ComponentSchema = {
  schema: ButtonPropsSchema,
  validateFn: validateButtonProps,
  safeValidateFn: safeValidateButtonProps
};

const buttonExamples: ComponentExample[] = [
  {
    title: "Basic Colors",
    description: "Standard button colors and variants",
    props: [
      { children: "Default" },
      { color: "primary", children: "Primary" },
      { color: "secondary", children: "Secondary" },
      { color: "accent", children: "Accent"
        }
      ]
  },
  {
    title: "Button Variants",
    description: "Different visual styles",
    props: [
      { variant: "outline", color: "primary", children: "Outline" },
      { variant: "ghost", color: "primary", children: "Ghost" },
      { variant: "link", color: "primary", children: "Link"
        }
      ]
  },
  {
    title: "Button Sizes",
    description: "Various sizes for different use cases",
    props: [
      { size: "xs", color: "primary", children: "XS" },
      { size: "sm", color: "primary", children: "SM" },
      { color: "primary", children: "MD" },
      { size: "lg", color: "primary", children: "LG"
        }
      ]
  },
  {
    title: "Button States",
    description: "Different states and interactions",
    props: [
      { color: "primary", children: "Normal" },
      { color: "primary", active: true, children: "Active" },
      { color: "primary", disabled: true, children: "Disabled" },
      { color: "primary", loading: true, children: "Loading"
        }
      ]
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
  ]
};
