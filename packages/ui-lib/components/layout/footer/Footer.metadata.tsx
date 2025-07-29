import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Footer } from "./Footer.tsx";

const footerExamples: ComponentExample[] = [
  {
    title: "Basic Footer",
    description: "Simple footer with copyright and links",
    props: {
      title: "My Company",
      description: "Building amazing products since 2024",
      copyright: "© 2024 My Company. All rights reserved."
    }
  },
  {
    title: "Footer with Logo",
    description: "Footer including company logo and branding"},
  {
    title: "Newsletter Footer",
    description: "Footer with newsletter signup functionality"},
  {
    title: "Social Media Footer",
    description: "Footer with social media links and icons"},
  {
    title: "Centered Footer",
    description: "Simple centered footer layout"},
  {
    title: "Grid Layout Footer",
    description: "Comprehensive footer with multiple sections"},
];

export const footerMetadata: ComponentMetadata = {
  name: "Footer",
  description: "Page footer section",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/footer",
  tags: ["footer", "bottom", "page", "links", "info", "section"],
  examples: footerExamples,
  relatedComponents: ["navbar", "hero", "divider"],
  preview: (
    <div class="w-full max-w-sm">
      <Footer
        title="My Company"
        description="Building amazing things"
        sections={[
          {
            title: "Product",
            links: [
              { text: "Features", href: "/features" },
              { text: "Pricing", href: "/pricing" },
            ]},
        ]}
      />
    </div>
  )};
