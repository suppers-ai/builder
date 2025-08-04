import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { BrowserMockup } from "./BrowserMockup.tsx";

const browserExamples: ComponentExample[] = [
  {
    title: "Basic Browser",
    description: "Simple browser window mockup",
    props: {
      url: "https://example.com",
      children: "Website content goes here",
    },
  },
  {
    title: "Browser with Toolbar",
    description: "Browser mockup with address bar and controls",
    props: {
      url: "https://example.com",
      children: "Website content goes here",
    },
  },
  {
    title: "Browser with Custom URL",
    description: "Browser showing dashboard with specific URL",
    props: {
      url: "https://example.com",
      children: "Website content goes here",
    },
  },
  {
    title: "Dark Theme Browser",
    description: "Browser mockup with dark theme",
    props: {
      url: "https://example.com",
      children: "Website content goes here",
    },
  },
  {
    title: "Responsive Browser",
    description: "Browser that adapts to different screen sizes",
    props: {
      url: "https://example.com",
      children: "Website content goes here",
    },
  },
];

export const browserMetadata: ComponentMetadata = {
  name: "Browser",
  description: "Browser window mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/browser",
  tags: ["browser", "mockup", "window", "frame", "demo", "showcase"],
  examples: browserExamples,
  relatedComponents: ["artboard", "window", "code"],
  preview: (
    <div class="w-80">
      <BrowserMockup url="https://example.com" showControls>
        <div class="bg-base-200 p-8 h-32 flex items-center justify-center">
          Website content goes here
        </div>
      </BrowserMockup>
    </div>
  ),
};
