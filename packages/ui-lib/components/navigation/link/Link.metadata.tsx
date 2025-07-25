import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Link } from "../../layout/link/Link.tsx";

const linkExamples: ComponentExample[] = [
  {
    title: "Basic Links",
    description: "Standard link variations and colors",
    code: `<Link href="#">Default Link</Link>
<Link href="#" color="primary">Primary Link</Link>
<Link href="#" color="secondary">Secondary Link</Link>
<Link href="#" color="accent">Accent Link</Link>`,
    showCode: true,
  },
  {
    title: "Link Variants",
    description: "Different link styles and behaviors",
    code: `<Link href="#" variant="hover">Hover Link</Link>
<Link href="#" variant="focus">Focus Link</Link>
<Link href="#" variant="neutral">Neutral Link</Link>`,
    showCode: true,
  },
  {
    title: "Link States",
    description: "Link states and styling options",
    code: `<Link href="#" underline>Underlined Link</Link>
<Link href="#" external>External Link</Link>
<Link href="#" disabled>Disabled Link</Link>`,
    showCode: true,
  },
  {
    title: "Link Colors",
    description: "Various color themes for links",
    code: `<Link href="#" color="info">Info Link</Link>
<Link href="#" color="success">Success Link</Link>
<Link href="#" color="warning">Warning Link</Link>
<Link href="#" color="error">Error Link</Link>`,
    showCode: true,
  },
];

export const linkMetadata: ComponentMetadata = {
  name: "Link",
  description: "Styled hyperlinks with support for colors, variants, and states",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/link",
  tags: ["link", "anchor", "hyperlink", "navigation", "url", "href"],
  examples: linkExamples,
  relatedComponents: ["button", "breadcrumbs", "menu"],
  interactive: false,
  preview: (
    <div class="flex gap-4 items-center">
      <Link href="#">Default link</Link>
      <Link href="#" color="primary">Primary link</Link>
      <Link href="#" color="secondary">Secondary link</Link>
    </div>
  ),
  useCases: ["Navigation", "External links", "In-content links", "Menu items"],
  usageNotes: [
    "Use href prop for link destination",
    "Set external=true for links that open in new tabs",
    "Use color prop to match your design theme",
    "Disabled links are not interactive and have reduced opacity",
    "External links automatically show an arrow indicator",
  ],
};
