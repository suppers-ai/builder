import { ComponentMetadata } from "../../types.ts";
import { Join } from "./Join.tsx";

export const joinMetadata: ComponentMetadata = {
  name: "Join",
  description: "Group connected elements",
  category: "Layout",
  path: "/components/layout/join",
  tags: ["join", "group", "connected", "buttons", "inputs", "segmented"],
  examples: ["basic", "vertical", "responsive", "with-buttons", "with-inputs"],
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
