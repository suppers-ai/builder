import { ComponentMetadata } from "../../types.ts";
import { Toast } from "./Toast.tsx";

export const toastMetadata: ComponentMetadata = {
  name: "Toast",
  description: "Popup notification",
  category: "Feedback",
  path: "/components/feedback/toast",
  tags: ["toast", "notification", "popup", "message", "temporary", "snackbar"],
  examples: ["basic", "positions", "colors", "with-actions", "stacked"],
  relatedComponents: ["alert", "modal", "button"],
  preview: (
    <div class="flex flex-col gap-2">
      <Toast message="This is a success message!" type="success" />
      <Toast message="Warning: Please check your input" type="warning" />
      <Toast message="Information: Update available" type="info" />
    </div>
  ),
};
