import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Alert } from "@suppers/ui-lib";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-preact";

export default function AlertDemo() {
  const examples = [
    {
      title: "Basic Alert",
      description: "Simple alert with text content",
      code: `<Alert>
  <span>Default alert message</span>
</Alert>`,
      preview: (
        <div class="space-y-4">
          <Alert>
            <span>Default alert message</span>
          </Alert>
        </div>
      ),
    },
    {
      title: "Alert Colors",
      description: "Different alert types for various messages",
      code: `<Alert color="success">
  <CheckCircle size={20} />
  <span>Success! Your changes have been saved.</span>
</Alert>`,
      preview: (
        <div class="space-y-4">
          <Alert color="info">
            <Info size={20} />
            <span>Info: Here's some helpful information.</span>
          </Alert>
          <Alert color="success">
            <CheckCircle size={20} />
            <span>Success! Your changes have been saved.</span>
          </Alert>
          <Alert color="warning">
            <AlertTriangle size={20} />
            <span>Warning: This action cannot be undone.</span>
          </Alert>
          <Alert color="error">
            <XCircle size={20} />
            <span>Error: Something went wrong. Please try again.</span>
          </Alert>
        </div>
      ),
    },
    {
      title: "Alert with Actions",
      description: "Alerts containing action buttons",
      code: `<Alert color="warning">
  <AlertTriangle size={20} />
  <span>Your session will expire in 5 minutes.</span>
  <div>
    <button class="btn btn-sm">Dismiss</button>
    <button class="btn btn-sm btn-primary">Extend Session</button>
  </div>
</Alert>`,
      preview: (
        <Alert color="warning">
          <AlertTriangle size={20} />
          <span>Your session will expire in 5 minutes.</span>
          <div>
            <button class="btn btn-sm">Dismiss</button>
            <button class="btn btn-sm btn-primary">Extend Session</button>
          </div>
        </Alert>
      ),
    },
    {
      title: "Alert Variants",
      description: "Different visual styles and layouts",
      code: `<Alert color="success" class="shadow-lg">
  <CheckCircle size={20} />
  <div>
    <h3 class="font-bold">Success!</h3>
    <div class="text-xs">Your account has been created successfully.</div>
  </div>
</Alert>`,
      preview: (
        <div class="space-y-4">
          <Alert color="success" class="shadow-lg">
            <CheckCircle size={20} />
            <div>
              <h3 class="font-bold">Success!</h3>
              <div class="text-xs">Your account has been created successfully.</div>
            </div>
          </Alert>
          <Alert color="error">
            <XCircle size={20} />
            <div>
              <h3 class="font-bold">Error!</h3>
              <div class="text-xs">
                Failed to save changes. Please check your internet connection.
              </div>
            </div>
            <button class="btn btn-sm btn-outline">Retry</button>
          </Alert>
        </div>
      ),
    },
    {
      title: "Compact Alerts",
      description: "Smaller alerts for inline messages",
      code: `<Alert color="info" class="py-2">
  <Info size={16} />
  <span class="text-sm">Compact info message</span>
</Alert>`,
      preview: (
        <div class="space-y-2">
          <Alert color="info" class="py-2">
            <Info size={16} />
            <span class="text-sm">Compact info message</span>
          </Alert>
          <Alert color="success" class="py-2">
            <CheckCircle size={16} />
            <span class="text-sm">Changes saved automatically</span>
          </Alert>
          <Alert color="warning" class="py-2">
            <AlertTriangle size={16} />
            <span class="text-sm">Form has unsaved changes</span>
          </Alert>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "children",
      type: "ComponentChildren",
      description: "Alert content (text, icons, buttons)",
      required: true,
    },
    {
      name: "color",
      type: "info | success | warning | error",
      description: "Alert type and color scheme",
    },
    {
      name: "dismissible",
      type: "boolean",
      default: "false",
      description: "Whether alert can be dismissed",
    },
    {
      name: "onDismiss",
      type: "() => void",
      description: "Callback when alert is dismissed",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use Alert for server-side rendered alerts",
    "For interactive alerts with dismiss functionality, create an island component",
    "Choose appropriate colors that match the message severity",
    "Include relevant icons to reinforce the alert type",
    "Keep alert messages concise and actionable",
    "Place alerts contextually near related content",
    "Use consistent alert patterns throughout your application",
  ];

  const accessibilityNotes = [
    "Alerts should have appropriate ARIA roles (alert, alertdialog, status)",
    "Use proper color contrast for text and background",
    "Don't rely solely on color to convey meaning",
    "Provide clear, descriptive text that explains the situation",
    "Ensure dismiss buttons are keyboard accessible",
    "Consider screen reader announcements for dynamic alerts",
    "Important alerts should capture user attention appropriately",
  ];

  const relatedComponents = [
    { name: "Toast", path: "/components/feedback/toast" },
    { name: "Modal", path: "/components/action/modal" },
    { name: "Badge", path: "/components/display/badge" },
    { name: "Button", path: "/components/action/button" },
  ];

  return (
    <ComponentPageTemplate
      title="Alert"
      description="Notification messages for success, warnings, errors, and information"
      category="Feedback"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
