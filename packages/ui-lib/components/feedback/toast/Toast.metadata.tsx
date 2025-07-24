import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Toast } from "./Toast.tsx";

const toastExamples: ComponentExample[] = [
  {
    title: "Basic Toast",
    description: "Simple toast notification message",
    code: `<Toast message="Your changes have been saved!" />`,
    showCode: true,
  },
  {
    title: "Different Positions",
    description: "Toast notifications in various screen positions",
    code: `<Toast 
  message="Top center notification" 
  position="top-center" 
/>
<Toast 
  message="Bottom right notification" 
  position="bottom-right" 
/>
<Toast 
  message="Top left notification" 
  position="top-left" 
/>`,
    showCode: true,
  },
  {
    title: "Color Variants",
    description: "Toast notifications with different types",
    code: `<Toast message="Success operation!" type="success" />
<Toast message="Warning: Please check your input" type="warning" />
<Toast message="Error occurred while processing" type="error" />
<Toast message="Information update available" type="info" />`,
    showCode: true,
  },
  {
    title: "Toast with Actions",
    description: "Toast notifications with action buttons",
    code: `<Toast 
  message="New message received"
  type="info"
  action="View"
  onAction={() => console.log("Action clicked")}
  dismissible
/>`,
    showCode: true,
  },
  {
    title: "Stacked Toasts",
    description: "Multiple toast notifications displayed together",
    code: `<div class="toast toast-top toast-end">
  <div class="alert alert-success">
    <span>First notification</span>
  </div>
  <div class="alert alert-info">
    <span>Second notification</span>
  </div>
  <div class="alert alert-warning">
    <span>Third notification</span>
  </div>
</div>`,
    showCode: true,
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
  ),
};
