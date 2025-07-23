import { ComponentMetadata } from "../../types.ts";
import { Steps } from "./Steps.tsx";

export const stepsMetadata: ComponentMetadata = {
  name: "Steps",
  description: "Step-by-step progress",
  category: "Navigation",
  path: "/components/navigation/steps",
  tags: ["steps", "stepper", "progress", "wizard", "multi-step", "workflow"],
  examples: ["basic", "vertical", "responsive", "with-data", "colors"],
  relatedComponents: ["timeline", "progress", "breadcrumbs"],
  preview: (
    <Steps
      steps={[
        { id: "1", label: "Register", completed: true },
        { id: "2", label: "Choose plan", completed: true },
        { id: "3", label: "Purchase", active: true },
        { id: "4", label: "Receive product" },
      ]}
    />
  ),
};
