import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Diff, DiffItem, DiffResizer } from "./Diff.tsx";

const diffExamples: ComponentExample[] = [
  {
    title: "Text Comparison",
    description: "Compare text content with draggable divider",
    props: {
      children: [
        <DiffItem item={1}>
          <DiffResizer class="bg-primary text-primary-content font-bold text-xl flex items-center justify-center">
            BEFORE
          </DiffResizer>
        </DiffItem>,
        <DiffItem item={2}>
          <DiffResizer class="bg-secondary text-secondary-content font-bold text-xl flex items-center justify-center">
            AFTER
          </DiffResizer>
        </DiffItem>
      ]
    }
  },
  {
    title: "Code Comparison",
    description: "Side-by-side code comparison",
    props: {
      children: [
        <DiffItem item={1}>
          <DiffResizer class="bg-base-200 p-4">
            <pre class="text-sm">
              <code>{`function hello() {
  console.log('Hello');
}`}</code>
            </pre>
          </DiffResizer>
        </DiffItem>,
        <DiffItem item={2}>
          <DiffResizer class="bg-base-200 p-4">
            <pre class="text-sm">
              <code>{`function hello() {
  console.log('Hello World!');
  return true;
}`}</code>
            </pre>
          </DiffResizer>
        </DiffItem>
      ]
    }
  },
  {
    title: "Custom Styling",
    description: "Diff with custom background colors",
    props: {
      class: "border border-base-300 rounded-lg overflow-hidden",
      children: [
        <DiffItem item={1}>
          <DiffResizer class="bg-error/20 text-error-content p-8 flex items-center justify-center">
            <div class="text-center">
              <h3 class="text-lg font-bold">Old Version</h3>
              <p>This is the previous state</p>
            </div>
          </DiffResizer>
        </DiffItem>,
        <DiffItem item={2}>
          <DiffResizer class="bg-success/20 text-success-content p-8 flex items-center justify-center">
            <div class="text-center">
              <h3 class="text-lg font-bold">New Version</h3>
              <p>This is the updated state</p>
            </div>
          </DiffResizer>
        </DiffItem>
      ]
    }
  },
  {
    title: "Content Comparison",
    description: "Compare different content areas",
    props: {
      children: [
        <DiffItem item={1}>
          <DiffResizer class="bg-base-100 p-6 flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-full mx-auto mb-2"></div>
              <p class="font-semibold">Original Design</p>
            </div>
          </DiffResizer>
        </DiffItem>,
        <DiffItem item={2}>
          <DiffResizer class="bg-base-100 p-6 flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 bg-secondary rounded-square mx-auto mb-2"></div>
              <p class="font-semibold">Updated Design</p>
            </div>
          </DiffResizer>
        </DiffItem>
      ]
    }
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
      <Diff>
        <DiffItem item={1}>
          <DiffResizer class="bg-primary text-primary-content font-bold text-sm flex items-center justify-center">
            BEFORE
          </DiffResizer>
        </DiffItem>
        <DiffItem item={2}>
          <DiffResizer class="bg-secondary text-secondary-content font-bold text-sm flex items-center justify-center">
            AFTER
          </DiffResizer>
        </DiffItem>
      </Diff>
    </div>
  )
};
