import { ComponentMetadata } from "../../types.ts";
import { Link } from "../../layout/link/Link.tsx";

export const linkMetadata: ComponentMetadata = {
  name: "Link",
  description: "Styled hyperlinks",
  category: "Navigation",
  path: "/components/navigation/link",
  tags: ["link", "anchor", "hyperlink", "navigation", "url", "href"],
  examples: ["basic", "colors", "hover", "neutral", "disabled"],
  relatedComponents: ["button", "breadcrumbs", "menu"],
  preview: (
    <div class="flex gap-4 items-center">
      <Link href="#">Default link</Link>
      <Link href="#" color="primary">Primary link</Link>
      <Link href="#" color="secondary">Secondary link</Link>
    </div>
  ),
};
