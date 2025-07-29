import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { RadialProgress } from "./RadialProgress.tsx";

const radialProgressExamples: ComponentExample[] = [
  {
    title: "Basic Radial Progress",
    description: "Simple circular progress indicator",
    props: {
      value: 75,
      max: 100
    }
  },  {
    title: "Different Colors",
    description: "Radial progress with various color themes",
    props: {
      value: 75,
      max: 100,
      color: "primary"
    }
  },  {
    title: "Different Sizes",
    description: "Radial progress indicators in various sizes",
    props: {
      value: 75,
      max: 100,
      size: "lg"
    }
  },  {
    title: "With Value Display",
    description: "Progress indicator showing percentage value",
    props: {
      value: 75,
      max: 100
    }
  },  {
    title: "Thick Progress Ring",
    description: "Progress indicator with thicker stroke",
    props: {
      value: 75,
      max: 100
    }
  },  {
    title: "Custom Dashboard",
    description: "Customized radial progress for dashboard display",
    props: {
      value: 75,
      max: 100
    }
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
  )};
