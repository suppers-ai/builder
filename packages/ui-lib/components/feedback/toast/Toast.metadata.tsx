import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Toast } from "./Toast.tsx";

const toastExamples: ComponentExample[] = [
  {
    title: "Basic Toast",
    description: "Simple toast notification message",
    props: {
      message: "Operation completed successfully!",
      type: "success"
    }
  },  {
    title: "Different Positions",
    description: "Toast notifications in various screen positions",
    props: {
      message: "Operation completed successfully!",
      type: "success"
    }
  },  {
    title: "Color Variants",
    description: "Toast notifications with different types",
    props: {
      message: "Operation completed successfully!",
      type: "success",
      color: "primary"
    }
  },  {
    title: "Toast with Actions",
    description: "Toast notifications with action buttons",
    props: {
      message: "Operation completed successfully!",
      type: "success"
    }
  },  {
    title: "Stacked Toasts",
    description: "Multiple toast notifications displayed together",
    props: {
      message: "Operation completed successfully!",
      type: "success"
    }
  },
];

export const toastMetadata: ComponentMetadata = {
  name: "Toast",
  description: "Popup notification",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/toast",
  tags: ["toast", "notification", "popup", "message", "temporary", "snackbar"],
  examples: toastExamples,
  relatedComponents: ["alert", "modal", "button"],
  preview: (
    <div class="flex flex-col gap-2">
      <Toast message="This is a success message!" type="success" />
      <Toast message="Warning: Please check your input" type="warning" />
      <Toast message="Information: Update available" type="info" />
    </div>
  )};
