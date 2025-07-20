import { ComponentMetadata } from "../../types.ts";
import { Footer } from "./Footer.tsx";

export const footerMetadata: ComponentMetadata = {
  name: "Footer",
  description: "Page footer section",
  category: "Layout",
  path: "/components/layout/footer",
  tags: ["footer", "bottom", "page", "links", "info", "section"],
  examples: ["basic", "with-logo", "newsletter", "social", "centered", "grid"],
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
              { text: "Pricing", href: "/pricing" }
            ]
          }
        ]}
      />
    </div>
  ),
};
