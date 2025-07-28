import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { RadialProgress } from "./RadialProgress.tsx";

const radialProgressExamples: ComponentExample[] = [
  {
    title: "Basic Radial Progress",
    description: "Simple circular progress indicator",
    code: `<RadialProgress value={70} />
<RadialProgress value={45} />
<RadialProgress value={90} />`,
    showCode: true,
  },
  {
    title: "Different Colors",
    description: "Radial progress with various color themes",
    code: `<RadialProgress value={80} color="primary" />
<RadialProgress value={65} color="secondary" />
<RadialProgress value={90} color="accent" />
<RadialProgress value={55} color="success" />`,
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "Radial progress indicators in various sizes",
    code: `<RadialProgress value={75} size="sm" />
<RadialProgress value={75} size="md" />
<RadialProgress value={75} size="lg" />`,
    showCode: true,
  },
  {
    title: "With Value Display",
    description: "Progress indicator showing percentage value",
    code: `<RadialProgress 
  value={85} 
  showValue 
  color="primary"
/>
<RadialProgress 
  value={42} 
  showValue 
  color="warning"
/>`,
    showCode: true,
  },
  {
    title: "Thick Progress Ring",
    description: "Progress indicator with thicker stroke",
    code: `<RadialProgress 
  value={60} 
  thickness="thick"
  color="success"
  showValue
/>`,
    showCode: true,
  },
  {
    title: "Custom Dashboard",
    description: "Customized radial progress for dashboard display",
    code: `<div class="grid grid-cols-3 gap-4">
  <div class="text-center">
    <RadialProgress 
      value={75} 
      color="primary" 
      showValue
      size="lg"
    />
    <p class="mt-2 text-sm">Sales Target</p>
  </div>
  <div class="text-center">
    <RadialProgress 
      value={92} 
      color="success" 
      showValue
      size="lg"
    />
    <p class="mt-2 text-sm">Customer Satisfaction</p>
  </div>
  <div class="text-center">
    <RadialProgress 
      value={38} 
      color="warning" 
      showValue
      size="lg"
    />
    <p class="mt-2 text-sm">Budget Used</p>
  </div>
</div>`,
    showCode: true,
  },
];

export const radialProgressMetadata: ComponentMetadata = {
  name: "Radial Progress",
  description: "Circular progress indicator",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/radial-progress",
  tags: ["progress", "circular", "radial", "percentage", "completion", "ring"],
  examples: radialProgressExamples,
  relatedComponents: ["progress", "countdown", "stat"],
  preview: (
    <div class="flex gap-4 items-center">
      <RadialProgress value={25} size="sm" showValue />
      <RadialProgress value={60} color="primary" showValue />
      <RadialProgress value={85} color="success" size="lg" showValue />
    </div>
  ),
};
