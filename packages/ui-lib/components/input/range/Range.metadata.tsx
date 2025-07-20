import { ComponentMetadata } from "../../types.ts";
import { Range } from "./Range.tsx";

export const rangeMetadata: ComponentMetadata = {
  name: "Range",
  description: "Slider input control",
  category: "Data Input",
  path: "/components/input/range",
  tags: ["range", "slider", "input", "form", "numeric", "control"],
  examples: ["basic", "sizes", "colors", "steps", "min-max", "with-value"],
  relatedComponents: ["progress", "form-control", "input"],
  preview: (
    <div class="flex flex-col gap-4 w-full">
      <Range value={40} color="primary" />
      <Range value={70} color="secondary" size="sm" />
      <Range value={25} color="accent" min={0} max={100} step={5} />
    </div>
  ),
};
