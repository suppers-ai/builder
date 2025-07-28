import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { PasswordInput } from "./PasswordInput.tsx";

const passwordInputExamples: ComponentExample[] = [
  {
    title: "Basic Password Input",
    description: "Simple password input with toggle visibility",
    props: {
      placeholder: "Enter password..."
    }
  },  {
    title: "Password Input Sizes",
    description: "Different sizes for various contexts",
    props: {
      placeholder: "Enter password...",
      size: "lg"
    }
  },  {
    title: "Password Input Colors",
    description: "Different color variants for validation states",
    props: {
      placeholder: "Enter password...",
      color: "primary"
    }
  },  {
    title: "Password Input Variants",
    description: "Different visual styles and states",
    props: {
      placeholder: "Enter password...",
      variant: "outlined"
    }
  },  {
    title: "Password Input with Auto-complete",
    description: "Password inputs for different form contexts",
    props: {
      placeholder: "Enter password..."
    }
  },
];

const passwordInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "Password input value"},
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text",
    default: "••••••••"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Input size",
    default: "md"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Input color theme for validation states"},
  {
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true"},
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false"},
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false"},
  {
    name: "required",
    type: "boolean",
    description: "Mark as required field",
    default: "false"},
  {
    name: "autoComplete",
    type: "string",
    description: "Auto-complete behavior",
    default: "current-password"},
  {
    name: "showToggle",
    type: "boolean",
    description: "Show password visibility toggle button",
    default: "true"},
  {
    name: "onChange",
    type: "(value: string) => void",
    description: "Called when input value changes"},
  {
    name: "onVisibilityToggle",
    type: "(visible: boolean) => void",
    description: "Called when visibility is toggled"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const passwordInputMetadata: ComponentMetadata = {
  name: "PasswordInput",
  description: "Secure password input with visibility toggle and validation support",
  category: ComponentCategory.INPUT,
  path: "/components/input/password-input",
  tags: ["password", "security", "authentication", "input", "form"],
  relatedComponents: ["input", "login-button", "email-input", "button"],
  interactive: true, // Has toggle functionality and form interactions
  preview: (
    <div class="flex flex-col gap-2">
      <div class="relative">
        <input type="password" class="input input-bordered pr-12" placeholder="••••••••" />
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>
    </div>
  ),
  examples: passwordInputExamples,
  props: passwordInputProps,
  variants: ["bordered", "ghost", "with-toggle", "disabled"],
  useCases: ["Login forms", "Registration forms", "Password change", "Settings"],
  usageNotes: [
    "Includes visibility toggle button by default for better UX",
    "Uses proper auto-complete values for password managers",
    "Static version shows password field, use Island for interactivity",
    "Color variants help indicate password strength or validation",
    "autoComplete='new-password' for registration, 'current-password' for login",
    "showToggle=false removes the visibility button for high-security contexts",
    "Eye icon changes based on visibility state",
    "Proper ARIA labels and keyboard accessibility built-in",
  ]};
