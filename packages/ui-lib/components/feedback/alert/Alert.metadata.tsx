import { ComponentMetadata } from "../../types.ts";
import { Alert } from "./Alert.tsx";

export const alertMetadata: ComponentMetadata = {
  name: "Alert",
  description: "Alert message display",
  category: "Feedback",
  path: "/components/feedback/alert",
  tags: ["alert", "message", "notification", "warning", "error", "info"],
  examples: ["basic", "colors", "with-icon", "with-actions", "dismissible"],
  relatedComponents: ["toast", "modal", "badge"],
  preview: (
    <div class="flex flex-col gap-2 w-full max-w-sm">
      <Alert color="info">This is an info alert message</Alert>
      <Alert color="success">Operation completed successfully</Alert>
      <Alert color="warning">Please review your settings</Alert>
    </div>
  ),
};
