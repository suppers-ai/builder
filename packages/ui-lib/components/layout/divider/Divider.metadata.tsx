import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Divider } from "./Divider.tsx";

const dividerExamples: ComponentExample[] = [
  {
    title: "Basic Divider",
    description: "Simple horizontal dividers for separating content",
    props: {
    }
  },
  {
    title: "Divider with Text",
    description: "Dividers with text labels for clearer section separation",
    props: [
      { text: "OR" },
      { text: "CONTINUE WITH"
        }
      ]},
  {
    title: "Text Position",
    description: "Different text positioning within the divider",
    props: [
      { text: "Start aligned", position: "start" },
      { text: "Center aligned", position: "center" },
      { text: "End aligned", position: "end"
        }
      ]},
  {
    title: "Vertical Dividers",
    description: "Vertical dividers for side-by-side content separation",
    props: [
      { vertical: true },
      { vertical: true, text: "OR"
        }
      ]},
  {
    title: "Dividers in Forms",
    description: "Real-world usage in forms and cards",
    props: [
      { text: "OR CONTINUE WITH" },
      {
        }
      ]},
];

const dividerProps: ComponentProp[] = [
  {
    name: "text",
    type: "string",
    description: "Text to display in the middle of the divider"},
  {
    name: "position",
    type: "'start' | 'center' | 'end'",
    description: "Horizontal alignment of the text within the divider",
    default: "center"},
  {
    name: "vertical",
    type: "boolean",
    description: "Whether to render as a vertical divider",
    default: "false"},
  {
    name: "responsive",
    type: "boolean",
    description: "Enable responsive behavior for the divider",
    default: "false"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const dividerMetadata: ComponentMetadata = {
  name: "Divider",
  description:
    "Visual separators for organizing content into distinct sections with optional text labels",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/divider",
  tags: ["divider", "separator", "line", "break", "section", "hr"],
  relatedComponents: ["card", "hero", "join"],
  interactive: false, // Visual separator, not interactive
  preview: (
    <div class="flex flex-col gap-4 w-full max-w-sm">
      <div class="text-sm">Section 1</div>
      <div class="divider"></div>
      <div class="text-sm">Section 2</div>
      <div class="divider">OR</div>
      <div class="text-sm">Section 3</div>
    </div>
  ),
  examples: dividerExamples,
  props: dividerProps,
  variants: ["basic", "with-text", "vertical", "positioned-text"],
  useCases: [
    "Form sections",
    "Content separation",
    "Navigation groups",
    "Login/signup flows",
    "Card sections",
  ],
  usageNotes: [
    "Use horizontal dividers to separate vertical content stacks",
    "Use vertical dividers in flex layouts to separate side-by-side content",
    "Keep divider text short and descriptive (e.g., 'OR', 'AND', section names)",
    "Text positioning helps create visual hierarchy in complex layouts",
    "Dividers improve readability by creating clear content boundaries",
    "Consider using semantic HTML elements like <hr> for screen readers when appropriate",
  ]};
