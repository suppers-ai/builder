import { Logo } from "./Logo.tsx";
import { ComponentMetadata } from "../../types.ts";

const metadata: ComponentMetadata = {
  name: "Logo",
  description:
    "A responsive logo component that automatically adapts to the current theme (light/dark variants)",
  category: "Display",
  examples: [
    {
      name: "Default Logo",
      description: "Basic logo with default settings",
      component: <Logo />,
    },
    {
      name: "Logo Sizes",
      description: "Different logo sizes available",
      component: (
        <div class="flex items-center gap-4">
          <Logo size="xs" />
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo size="xl" />
        </div>
      ),
    },
    {
      name: "Logo Variants",
      description: "Long and short logo variants",
      component: (
        <div class="flex flex-col items-start gap-4">
          <Logo variant="long" />
          <Logo variant="short" />
        </div>
      ),
    },
    {
      name: "Logo with Link",
      description: "Logo wrapped in a clickable link",
      component: <Logo href="/" />,
    },
    {
      name: "Custom Styling",
      description: "Logo with custom classes and alt text",
      component: (
        <Logo
          alt="Custom Suppers Logo"
          class="border-2 border-primary rounded-lg p-2"
          size="lg"
        />
      ),
    },
  ],
  props: [
    {
      name: "variant",
      type: '"long" | "short"',
      defaultValue: '"long"',
      description: "Logo variant - long shows full logo, short shows icon only",
    },
    {
      name: "size",
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
      defaultValue: '"md"',
      description: "Size of the logo",
    },
    {
      name: "alt",
      type: "string",
      defaultValue: '"Suppers Logo"',
      description: "Alt text for the logo image",
    },
    {
      name: "href",
      type: "string",
      defaultValue: "undefined",
      description: "Optional URL to wrap the logo in a link",
    },
    {
      name: "class",
      type: "string",
      defaultValue: '""',
      description: "Additional CSS classes to apply",
    },
    {
      name: "id",
      type: "string",
      defaultValue: "undefined",
      description: "HTML id attribute",
    },
  ],
  accessibility: {
    keyboardNavigation: "When used with href, the logo link is keyboard accessible via Tab key",
    screenReader:
      "Alt text is provided for screen readers. Logo automatically adapts to theme for better contrast",
    highContrast: "Logo automatically switches between light and dark variants based on theme",
  },
  examples_description:
    "The Logo component automatically detects the current theme and displays the appropriate logo variant (light or dark). It supports both long and short logo variants and can be used as a standalone image or wrapped in a link.",
};

export default metadata;
