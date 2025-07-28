import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Alert } from "./Alert.tsx";

const alertExamples: ComponentExample[] = [
  {
    title: "Basic Alert",
    description: "Simple alert with icon and message",
    props: {
      type: "info",
      children: "This is an informational alert message."
    }
  },  {
    title: "Alert Types",
    description: "Different alert types for various messages",
    props: {
      type: "info",
      children: "This is an informational alert message."
    }
  },  {
    title: "Alert with Actions",
    description: "Alerts containing action buttons",
    props: {
      type: "info",
      children: "This is an informational alert message."
    }
  },  {
    title: "Rich Content Alert",
    description: "Alert with title and detailed content",
    props: {
      type: "info",
      children: "This is an informational alert message."
    }
  },  {
    title: "Compact Alert",
    description: "Smaller alert for inline messages",
    props: {
      type: "info",
      children: "This is an informational alert message."
    }
  },
];

const alertProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Alert content including icon, text, and actions",
    required: true},
  {
    name: "color",
    type: "'info' | 'success' | 'warning' | 'error'",
    description: "Alert color theme indicating message type"},
  {
    name: "variant",
    type: "'filled' | 'outline'",
    description: "Visual style variant",
    default: "filled"},
  {
    name: "dismissible",
    type: "boolean",
    description: "Whether alert can be dismissed by user",
    default: "false"},
  {
    name: "onDismiss",
    type: "() => void",
    description: "Function called when alert is dismissed"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const alertMetadata: ComponentMetadata = {
  name: "Alert",
  description: "Contextual feedback messages for informing users about important information",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/alert",
  tags: ["message", "notification", "feedback", "status"],
  relatedComponents: ["toast", "modal", "badge"],
  interactive: false, // Can be interactive with dismiss functionality
  preview: (
    <div class="space-y-2">
      <div class="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span>Information alert</span>
      </div>
      <div class="alert alert-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
        <span>Success alert</span>
      </div>
    </div>
  ),
  examples: alertExamples,
  props: alertProps,
  variants: ["info", "success", "warning", "error", "with-actions", "compact"],
  useCases: ["Error messages", "Success notifications", "Warnings", "Information", "System status"],
  usageNotes: [
    "Always include an appropriate icon to reinforce the message type",
    "Use semantic colors: info (blue), success (green), warning (yellow), error (red)",
    "Keep message text concise and actionable",
    "Include action buttons when user needs to respond",
    "Consider dismissible alerts for non-critical messages",
    "Use proper heading hierarchy for rich content alerts",
    "Ensure sufficient color contrast for accessibility",
  ]};
