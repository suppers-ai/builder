import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";

const loginButtonExamples: ComponentExample[] = [
  {
    title: "Basic Login Button",
    description: "Simple login button with default styling",
    props: {
      children: "Login"
    }
  },  {
    title: "Login Button Variants",
    description: "Different visual styles for login buttons",
    props: {
      children: "Login",
      variant: "outlined"
    }
  },  {
    title: "Login Button Sizes",
    description: "Different sizes for various contexts",
    props: {
      children: "Login",
      size: "lg"
    }
  },  {
    title: "Login Button States",
    description: "Different states and configurations",
    props: {
      children: "Login"
    }
  },  {
    title: "Custom Login Buttons",
    description: "Customized login buttons for different use cases",
    props: {
      children: "Login"
    }
  },
];

const loginButtonProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Button text content",
    default: "Login"},
  {
    name: "variant",
    type:
      "'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'error'",
    description: "Visual style variant",
    default: "primary"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Button size",
    default: "md"},
  {
    name: "href",
    type: "string",
    description: "URL to navigate to (renders as link)",
    default: "/login"},
  {
    name: "onClick",
    type: "() => void",
    description: "Click handler function"},
  {
    name: "loading",
    type: "boolean",
    description: "Show loading state",
    default: "false"},
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the button",
    default: "false"},
  {
    name: "showIcon",
    type: "boolean",
    description: "Show login icon",
    default: "true"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const loginButtonMetadata: ComponentMetadata = {
  name: "LoginButton",
  description: "Specialized button component for user authentication with built-in login icon",
  category: ComponentCategory.ACTION,
  path: "/components/action/login-button",
  tags: ["authentication", "login", "auth", "user"],
  relatedComponents: ["button", "user-profile-dropdown", "search-button"],
  interactive: true, // Can handle click events and navigation
  preview: (
    <div class="flex gap-2">
      <button class="btn btn-primary">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m15 3 3 3-3 3" />
          <path d="M10 17V7" />
          <path d="M14 6h8" />
        </svg>
        Login
      </button>
    </div>
  ),
  examples: loginButtonExamples,
  props: loginButtonProps,
  variants: ["primary", "secondary", "accent", "ghost", "link", "outline"],
  useCases: ["User authentication", "Login forms", "Navigation bars", "Landing pages"],
  usageNotes: [
    "Includes LogIn icon from Lucide by default",
    "Can render as link or button depending on props",
    "Uses Button component internally for consistent styling",
    "Set showIcon={false} to hide the login icon",
    "Loading state automatically disables the button",
    "href prop makes it render as a navigation link",
  ]};
