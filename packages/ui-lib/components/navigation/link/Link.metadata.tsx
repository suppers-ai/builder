import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Link } from "./Link.tsx";

const linkExamples: ComponentExample[] = [
  {
    title: "Basic Links",
    description: "Simple links with different styles",
    props: {
      href: "#",
      children: "Click here",
    },
  },
  {
    title: "Link Colors",
    description: "Links with different color themes",
    props: {
      href: "#",
      children: "Click here",
      color: "primary",
    },
  },
  {
    title: "Link Variants",
    description: "Different link behaviors and styles",
    props: {
      href: "#",
      children: "Click here",
      variant: "outlined",
    },
  },
  {
    title: "Interactive Links",
    description: "Links with custom click handlers",
    props: {
      href: "#",
      children: "Click here",
    },
  },
];

const linkProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Link text content",
    required: true,
  },
  {
    name: "href",
    type: "string",
    description: "URL or path to navigate to",
  },
  {
    name: "variant",
    type: "'default' | 'hover' | 'focus' | 'neutral'",
    description: "Link variant style",
    default: "default",
  },
  {
    name: "color",
    type: "DaisyUIColor",
    description: "Color theme for the link",
  },
  {
    name: "underline",
    type: "boolean",
    description: "Whether link is underlined",
    default: "false",
  },
  {
    name: "external",
    type: "boolean",
    description: "Whether link is external (opens in new tab)",
    default: "false",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Whether link is disabled",
    default: "false",
  },
  {
    name: "onClick",
    type: "(e: Event) => void",
    description: "Custom click handler",
  },
  {
    name: "onNavigate",
    type: "(href: string) => void",
    description: "Callback when navigation occurs",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const linkMetadata: ComponentMetadata = {
  name: "Link",
  description:
    "Styled navigation links with support for external links, custom styles, and interaction handlers",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/link",
  tags: ["link", "navigation", "anchor", "url", "routing"],
  relatedComponents: ["button", "navbar", "breadcrumbs"],
  interactive: true,
  preview: (
    <div class="flex flex-col gap-2">
      <a class="link link-primary">Primary Link</a>
      <a class="link link-hover">Hover Link</a>
      <a class="link underline">Underlined Link</a>
    </div>
  ),
  examples: linkExamples,
  props: linkProps,
  variants: ["default", "hover", "focus", "neutral", "underlined", "external"],
  useCases: ["Navigation menus", "Text links", "External references", "Call-to-action buttons"],
  usageNotes: [
    "Use external prop for links to other websites",
    "External links automatically show an indicator icon",
    "Disabled links prevent navigation and show visual feedback",
    "Use onNavigate for custom routing logic",
    "Color variants integrate with DaisyUI theme system",
  ],
};
