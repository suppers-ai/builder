import { ComponentMetadata } from "../../types.ts";
import { Radio } from "./Radio.tsx";

export const radioMetadata: ComponentMetadata = {
  name: "Radio",
  description: "Single choice selection",
  category: "Data Input",
  path: "/components/input/radio",
  tags: ["radio", "input", "form", "choice", "selection", "option"],
  examples: ["basic", "sizes", "colors", "disabled", "with-labels", "in-form"],
  relatedComponents: ["checkbox", "select", "form-control"],
  preview: (
    <div class="flex flex-col gap-2">
      <Radio name="option" label="Option 1" value="1" checked />
      <Radio name="option" label="Option 2" value="2" />
      <Radio name="option" label="Option 3" value="3" color="secondary" />
    </div>
  ),
};
