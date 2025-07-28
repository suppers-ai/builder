import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Hero } from "./Hero.tsx";

const heroExamples: ComponentExample[] = [
  {
    title: "Basic Hero",
    description: "Simple hero section with title, subtitle, and CTA",
    code: `<Hero
  title="Welcome to Our Platform"
  subtitle="Build amazing applications with our modern tools and components"
  primaryCTA={{
    text: "Get Started",
    href: "/signup"
  }}
/>`,
    props: {
      title: "Welcome to Our Platform",
      subtitle: "Build amazing applications with our modern tools and components",
      primaryCTA: {
        text: "Get Started",
        href: "/signup"
      }
    },
    showCode: true,
  },
  {
    title: "Hero with Figure",
    description: "Hero with content/image on the side",
    code: `<Hero
  title="Revolutionary Design System"
  subtitle="Create beautiful interfaces with our comprehensive component library"
  primaryCTA={{ text: "Start Building" }}
  secondaryCTA={{ text: "View Demo" }}
  variant="split"
  content={
    <img 
      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" 
      class="max-w-sm rounded-lg shadow-2xl" 
      alt="Hero"
    />
  }
/>`,
    props: {
      title: "Revolutionary Design System",
      subtitle: "Create beautiful interfaces with our comprehensive component library",
      primaryCTA: { text: "Start Building" },
      secondaryCTA: { text: "View Demo" },
      variant: "split",
      content: (
        <img 
          src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" 
          class="max-w-sm rounded-lg shadow-2xl" 
          alt="Hero"
        />
      )
    },
    showCode: true,
  },
  {
    title: "Overlay Hero",
    description: "Hero with background image and overlay content",
    code: `<Hero
  title="Transform Your Business"
  subtitle="Join thousands of companies already using our platform"
  variant="overlay"
  background="image"
  backgroundImage="https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.jpg"
  primaryCTA={{ text: "Learn More" }}
  align="center"
  size="lg"
/>`,
    props: {
      title: "Transform Your Business",
      subtitle: "Join thousands of companies already using our platform",
      variant: "overlay",
      background: "image",
      backgroundImage: "https://img.daisyui.com/images/stock/photo-1507003211169-0a1dd7228f2d.jpg",
      primaryCTA: { text: "Learn More" },
      align: "center",
      size: "lg"
    },
    showCode: true,
  },
  {
    title: "Centered Content",
    description: "Hero with centered layout and gradient background",
    code: `<Hero
  title="Innovation Starts Here"
  subtitle="Discover the future of digital experiences"
  variant="centered"
  background="gradient"
  primaryCTA={{ text: "Explore Now" }}
  secondaryCTA={{ text: "Watch Video" }}
  align="center"
/>`,
    props: {
      title: "Innovation Starts Here",
      subtitle: "Discover the future of digital experiences",
      variant: "centered",
      background: "gradient",
      primaryCTA: { text: "Explore Now" },
      secondaryCTA: { text: "Watch Video" },
      align: "center"
    },
    showCode: true,
  },
  {
    title: "Full-Screen Hero",
    description: "Full viewport height hero for landing pages",
    code: `<Hero
  title="Build the Future"
  subtitle="Everything you need to create exceptional user experiences"
  variant="minimal"
  size="full"
  primaryCTA={{ text: "Start Free Trial" }}
  align="center"
  background="gradient"
/>`,
    showCode: true,
  },
];

export const heroMetadata: ComponentMetadata = {
  name: "Hero",
  description: "Large banner section",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/hero",
  tags: ["hero", "banner", "landing", "cta", "background", "feature"],
  examples: heroExamples,
  relatedComponents: ["card", "artboard", "footer"],
  preview: (
    <div class="w-full max-w-md">
      <Hero
        title="Welcome to Our App"
        subtitle="Build amazing things with our platform"
        primaryCTA={{
          text: "Get Started",
          onClick: () => {},
        }}
        className="h-48"
      />
    </div>
  ),
};
