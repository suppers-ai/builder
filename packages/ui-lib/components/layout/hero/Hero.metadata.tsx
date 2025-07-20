import { ComponentMetadata } from "../../types.ts";
import { Hero } from "./Hero.tsx";

export const heroMetadata: ComponentMetadata = {
  name: "Hero",
  description: "Large banner section",
  category: "Layout",
  path: "/components/layout/hero",
  tags: ["hero", "banner", "landing", "cta", "background", "feature"],
  examples: ["basic", "with-figure", "overlay", "content", "full-screen"],
  relatedComponents: ["card", "artboard", "footer"],
  preview: (
    <div class="w-full max-w-md">
      <Hero
        title="Welcome to Our App"
        subtitle="Build amazing things with our platform"
        primaryCTA={{
          text: "Get Started",
          onClick: () => {}
        }}
        className="h-48"
      />
    </div>
  ),
};
