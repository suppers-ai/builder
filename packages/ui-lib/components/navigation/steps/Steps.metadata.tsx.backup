import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Steps } from "./Steps.tsx";

const stepsExamples: ComponentExample[] = [
  {
    title: "Basic Steps",
    description: "Simple progress steps indicator",
    code: `<Steps
  steps={[
    { id: "1", label: "Register", completed: true },
    { id: "2", label: "Choose plan", completed: true },
    { id: "3", label: "Purchase", active: true },
    { id: "4", label: "Receive product" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Vertical Steps",
    description: "Steps displayed in vertical layout",
    code: `<Steps
  steps={[
    { 
      id: "order",
      label: "Order Confirmed",
      description: "Your order has been placed successfully",
      completed: true
    },
    { 
      id: "preparing",
      label: "Preparing",
      description: "We're preparing your order for shipment",
      active: true
    },
    { 
      id: "shipped",
      label: "Shipped",
      description: "Your order is on its way"
    },
    { 
      id: "delivered",
      label: "Delivered",
      description: "Order delivered to your address"
    }
  ]}
  orientation="vertical"
/>`,
    showCode: true,
  },
  {
    title: "Responsive Steps",
    description: "Steps that adapt to different screen sizes",
    code: `<Steps
  steps={[
    { id: "1", label: "Cart", completed: true },
    { id: "2", label: "Shipping", completed: true },
    { id: "3", label: "Payment", active: true },
    { id: "4", label: "Review" },
    { id: "5", label: "Complete" }
  ]}
  responsive="true"
/>`,
    showCode: true,
  },
  {
    title: "Steps with Data",
    description: "Steps with additional information and descriptions",
    code: `<Steps
  steps={[
    { 
      id: "setup",
      label: "Project Setup",
      description: "Initialize project repository and dependencies",
      completed: true
    },
    { 
      id: "development",
      label: "Development",
      description: "Implement core features and functionality",
      active: true
    },
    { 
      id: "testing",
      label: "Testing",
      description: "Quality assurance and bug testing"
    },
    { 
      id: "deployment",
      label: "Deployment",
      description: "Deploy to production environment"
    }
  ]}
  showDescription
/>`,
    showCode: true,
  },
  {
    title: "Colored Steps",
    description: "Steps with different color themes",
    code: `<Steps
  steps={[
    { id: "1", label: "Start", completed: true },
    { id: "2", label: "Progress", active: true },
    { id: "3", label: "Review" },
    { id: "4", label: "Finish" }
  ]}
  color="success"
/>

<Steps
  steps={[
    { id: "a", label: "Planning", completed: true },
    { id: "b", label: "Execution", active: true },
    { id: "c", label: "Review" },
    { id: "d", label: "Complete" }
  ]}
  color="primary"
  class="mt-4"
/>`,
    showCode: true,
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
  ),
};
