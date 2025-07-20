import { type PageProps } from "fresh";
import { ComponentPageTemplate, LoginButton } from "@suppers/ui-lib";

export default function LoginButtonDemo(props: PageProps) {
  if (props.state) {
    (props.state as any).title = "LoginButton - DaisyUI Component Library";
  }

  const examples = [
    {
      title: "Basic Login Button",
      description: "Default login button with icon",
      code: `<LoginButton>Login</LoginButton>
<LoginButton variant="secondary">Sign In</LoginButton>
<LoginButton variant="outline">Log In</LoginButton>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <LoginButton>Login</LoginButton>
          <LoginButton variant="secondary">Sign In</LoginButton>
          <LoginButton variant="outline">Log In</LoginButton>
        </div>
      ),
    },
    {
      title: "Button Sizes",
      description: "Different sizes for various layouts",
      code: `<LoginButton size="sm">Small</LoginButton>
<LoginButton>Medium</LoginButton>
<LoginButton size="lg">Large</LoginButton>`,
      preview: (
        <div class="flex flex-wrap items-center gap-4">
          <LoginButton size="sm">Small</LoginButton>
          <LoginButton>Medium</LoginButton>
          <LoginButton size="lg">Large</LoginButton>
        </div>
      ),
    },
    {
      title: "States",
      description: "Loading and disabled states",
      code: `<LoginButton>Normal</LoginButton>
<LoginButton loading>Loading</LoginButton>
<LoginButton disabled>Disabled</LoginButton>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <LoginButton>Normal</LoginButton>
          <LoginButton loading>Loading</LoginButton>
          <LoginButton disabled>Disabled</LoginButton>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "children",
      type: "ComponentChildren",
      default: "'Login'",
      description: "Button text content",
    },
    {
      name: "variant",
      type: "'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'error' | 'outline'",
      default: "'primary'",
      description: "Button visual style",
    },
    {
      name: "size",
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Button size",
    },
    {
      name: "href",
      type: "string",
      default: "'/login'",
      description: "URL to navigate to when clicked",
    },
    {
      name: "onClick",
      type: "() => void",
      description: "Custom click handler (overrides href navigation)",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Show loading spinner",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disable button interactions",
    },
    {
      name: "showIcon",
      type: "boolean",
      default: "true",
      description: "Show login icon",
    },
  ];

  const usageNotes = [
    "Use LoginButton for authentication flows to provide consistent login UI",
    "Button automatically navigates to /login unless custom onClick is provided",
    "Icon can be hidden with showIcon={false} for text-only buttons",
    "Integrates with authentication systems through custom onClick handlers",
  ];

  const accessibilityNotes = [
    "Button is keyboard accessible with Enter and Space key support",
    "Loading state announces to screen readers",
    "Icon has appropriate ARIA labeling",
    "Disabled state is properly announced to assistive technologies",
  ];

  const relatedComponents = [
    { name: "Button", path: "/components/action/button" },
    { name: "UserProfileDropdown", path: "/components/navigation/user-profile-dropdown" },
    { name: "SearchButton", path: "/components/action/search-button" },
  ];

  return (
    <ComponentPageTemplate
      title="LoginButton"
      description="Dedicated login button component with authentication-focused styling and behavior"
      category="Actions"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}