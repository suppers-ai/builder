import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Join } from "./Join.tsx";

const joinExamples: ComponentExample[] = [
  {
    title: "Basic Join",
    description: "Simple horizontal button group",
    props: {
      children: [
        <button class="btn join-item">Button 1</button>,
        <button class="btn join-item btn-active">Button 2</button>,
        <button class="btn join-item">Button 3</button>,
      ],
    },
  },
  {
    title: "Vertical Join",
    description: "Vertically stacked joined elements",
    props: {
      vertical: true,
      children: [
        <input class="input input-bordered join-item" placeholder="Email" />,
        <input class="input input-bordered join-item" placeholder="Password" />,
        <button class="btn btn-primary join-item">Sign In</button>,
      ],
    },
  },
  {
    title: "Responsive Join",
    description: "Join that adapts to screen size",
  },
  {
    title: "Join with Buttons",
    description: "Various button combinations in a join",
  },
  {
    title: "Join with Inputs",
    description: "Form elements joined together",
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
