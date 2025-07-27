import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Join } from "./Join.tsx";

const joinExamples: ComponentExample[] = [
  {
    title: "Basic Join",
    description: "Simple horizontal button group",
    code: `<Join>
  <button class="btn join-item">Button 1</button>
  <button class="btn join-item btn-active">Button 2</button>
  <button class="btn join-item">Button 3</button>
</Join>`,
    props: {
      children: [
        <button class="btn join-item">Button 1</button>,
        <button class="btn join-item btn-active">Button 2</button>,
        <button class="btn join-item">Button 3</button>
      ]
    },
    showCode: true,
  },
  {
    title: "Vertical Join",
    description: "Vertically stacked joined elements",
    code: `<Join vertical>
  <input class="input input-bordered join-item" placeholder="Email" />
  <input class="input input-bordered join-item" placeholder="Password" />
  <button class="btn btn-primary join-item">Sign In</button>
</Join>`,
    props: {
      vertical: true,
      children: [
        <input class="input input-bordered join-item" placeholder="Email" />,
        <input class="input input-bordered join-item" placeholder="Password" />,
        <button class="btn btn-primary join-item">Sign In</button>
      ]
    },
    showCode: true,
  },
  {
    title: "Responsive Join",
    description: "Join that adapts to screen size",
    code: `<Join responsive>
  <button class="btn join-item">Home</button>
  <button class="btn join-item">About</button>
  <button class="btn join-item">Services</button>
  <button class="btn join-item">Contact</button>
</Join>`,
    showCode: true,
  },
  {
    title: "Join with Buttons",
    description: "Various button combinations in a join",
    code: `<div class="space-y-4">
  <Join>
    <button class="btn btn-outline join-item">Previous</button>
    <button class="btn btn-outline join-item">1</button>
    <button class="btn btn-outline join-item btn-active">2</button>
    <button class="btn btn-outline join-item">3</button>
    <button class="btn btn-outline join-item">Next</button>
  </Join>
  
  <Join>
    <button class="btn btn-primary join-item">Save</button>
    <button class="btn btn-secondary join-item">Edit</button>
    <button class="btn btn-error join-item">Delete</button>
  </Join>
</div>`,
    showCode: true,
  },
  {
    title: "Join with Inputs",
    description: "Form elements joined together",
    code: `<div class="space-y-4">
  <Join>
    <input class="input input-bordered join-item flex-1" placeholder="Search..." />
    <button class="btn btn-primary join-item">Search</button>
  </Join>
  
  <Join>
    <select class="select select-bordered join-item">
      <option>Country</option>
      <option>USA</option>
      <option>Canada</option>
      <option>UK</option>
    </select>
    <input class="input input-bordered join-item flex-1" placeholder="City" />
    <input class="input input-bordered join-item" placeholder="ZIP" />
  </Join>
</div>`,
    showCode: true,
  },
];

export const joinMetadata: ComponentMetadata = {
  name: "Join",
  description: "Group connected elements",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/join",
  tags: ["join", "group", "connected", "buttons", "inputs", "segmented"],
  examples: joinExamples,
  relatedComponents: ["button", "input", "radio"],
  preview: (
    <div class="flex flex-col gap-4">
      <Join>
        <button class="btn join-item">Button 1</button>
        <button class="btn join-item btn-active">Button 2</button>
        <button class="btn join-item">Button 3</button>
      </Join>
      <Join vertical>
        <input class="input input-bordered join-item" placeholder="Email" />
        <input class="input input-bordered join-item" placeholder="Password" />
        <button class="btn btn-primary join-item">Submit</button>
      </Join>
    </div>
  ),
};
