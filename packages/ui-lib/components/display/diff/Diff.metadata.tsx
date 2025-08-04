import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Diff, DiffItem, DiffResizer } from "./Diff.tsx";

const diffExamples: ComponentExample[] = [
  {
    title: "Basic Diff",
    description: "Simple before and after comparison",
    props: {
      item1Content: "BEFORE",
      item2Content: "AFTER",
    },
  },
  {
    title: "Custom Content",
    description: "Diff with custom text content",
    props: {
      item1Content: "Original Version",
      item2Content: "Updated Version",
      item1Label: "Old",
      item2Label: "New",
    },
  },
  {
    title: "Custom Styling",
    description: "Diff with custom background colors",
    props: {
      item1Content: "Error State",
      item2Content: "Success State",
      item1Class: "bg-error text-error-content font-bold text-lg flex items-center justify-center",
      item2Class:
        "bg-success text-success-content font-bold text-lg flex items-center justify-center",
    },
  },
  {
    title: "Code Comparison",
    description: "Compare code snippets",
    props: {
      item1Content: "console.log('Hello');",
      item2Content: "console.log('Hello World!');",
      item1Class: "bg-base-200 p-4 font-mono text-sm flex items-center justify-center",
      item2Class: "bg-base-200 p-4 font-mono text-sm flex items-center justify-center",
      item1Label: "Before",
      item2Label: "After",
    },
  },
];

export const diffMetadata: ComponentMetadata = {
  name: "Diff",
  description: "Visual comparison component with draggable resizer",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/diff",
  tags: ["diff", "comparison", "before", "after", "resizer", "visual"],
  examples: diffExamples,
  relatedComponents: ["carousel", "mockup"],
  preview: (
    <div class="w-full max-w-md">
      <Diff
        item1Content="BEFORE"
        item2Content="AFTER"
        item1Class="bg-primary text-primary-content font-bold text-sm flex items-center justify-center"
        item2Class="bg-secondary text-secondary-content font-bold text-sm flex items-center justify-center"
      />
    </div>
  ),
};
