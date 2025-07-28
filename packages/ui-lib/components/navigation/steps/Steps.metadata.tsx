import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Steps } from "./Steps.tsx";

const stepsExamples: ComponentExample[] = [
  {
    title: "Basic Steps",
    description: "Simple progress steps indicator",
    props: {
      steps: [
        {
          id: "1",
      label: "Step 1",
      completed: true
        },
        {
          id: "2",
      label: "Step 2",
      active: true
        },
        {
          id: "3",
      label: "Step 3"
        }
      ]
    }
  },  {
    title: "Vertical Steps",
    description: "Steps displayed in vertical layout",
    props: {
      steps: [
        {
          id: "1",
      label: "Step 1",
      completed: true
        },
        {
          id: "2",
      label: "Step 2",
      active: true
        },
        {
          id: "3",
      label: "Step 3"
        }
      ]
    }
  },  {
    title: "Responsive Steps",
    description: "Steps that adapt to different screen sizes",
    props: {
      steps: [
        {
          id: "1",
      label: "Step 1",
      completed: true
        },
        {
          id: "2",
      label: "Step 2",
      active: true
        },
        {
          id: "3",
      label: "Step 3"
        }
      ]
    }
  },  {
    title: "Steps with Data",
    description: "Steps with additional information and descriptions",
    props: {
      steps: [
        {
          id: "1",
      label: "Step 1",
      completed: true
        },
        {
          id: "2",
      label: "Step 2",
      active: true
        },
        {
          id: "3",
      label: "Step 3"
        }
      ]
    }
  },  {
    title: "Colored Steps",
    description: "Steps with different color themes",
    props: {
      steps: [
        {
          id: "1",
      label: "Step 1",
      completed: true
        },
        {
          id: "2",
      label: "Step 2",
      active: true
        },
        {
          id: "3",
      label: "Step 3"
        }
      ],
      color: "primary"
    }
  },
];

export const stepsMetadata: ComponentMetadata = {
  name: "Steps",
  description: "Step-by-step progress",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/steps",
  tags: ["steps", "stepper", "progress", "wizard", "multi-step", "workflow"],
  examples: stepsExamples,
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
  )};
