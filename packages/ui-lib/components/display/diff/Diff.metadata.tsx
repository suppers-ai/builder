import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Diff } from "./Diff.tsx";

const diffExamples: ComponentExample[] = [
  {
    title: "Basic Diff",
    description: "Simple code difference comparison",
    code: `<Diff
  oldContent="function hello() {
  console.log('Hello');
}"
  newContent="function hello() {
  console.log('Hello World!');
  return true;
}"
  oldLabel="Before"
  newLabel="After"
/>`,
    showCode: true,
  },
  {
    title: "Diff with Line Numbers",
    description: "Code comparison with line number display",
    code: `<Diff
  oldContent="const items = [1, 2, 3];
let total = 0;
for (let item of items) {
  total += item;
}
console.log(total);"
  newContent="const items = [1, 2, 3, 4, 5];
let total = 0;
for (let item of items) {
  total += item * 2;
}
console.log('Total:', total);"
  showLineNumbers
  oldLabel="Version 1"
  newLabel="Version 2"
/>`,
    showCode: true,
  },
  {
    title: "Inline Diff Mode",
    description: "Changes displayed inline within unified view",
    code: `<Diff
  oldContent="The quick brown fox jumps over the lazy dog."
  newContent="The quick red fox leaps over the sleeping dog."
  mode="inline"
  oldLabel="Original"
  newLabel="Modified"
/>`,
    showCode: true,
  },
  {
    title: "Side-by-Side Diff",
    description: "Split view showing changes side by side",
    code: `<Diff
  oldContent="function validateEmail(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}"
  newContent="function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return false;
  return regex.test(email);
}"
  mode="split"
  showLineNumbers
  oldLabel="Old Implementation"
  newLabel="New Implementation"
  size="lg"
/>`,
    showCode: true,
  },
];

export const diffMetadata: ComponentMetadata = {
  name: "Diff",
  description: "Code difference display",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/diff",
  tags: ["diff", "comparison", "code", "changes", "additions", "deletions"],
  examples: diffExamples,
  relatedComponents: ["code", "mockup", "pre"],
  preview: (
    <div class="w-full max-w-md">
      <Diff
        oldContent="function hello() {
  console.log('Hello');
}"
        newContent="function hello() {
  console.log('Hello World!');
  return true;
}"
        oldLabel="Before"
        newLabel="After"
        size="sm"
      />
    </div>
  ),
};
