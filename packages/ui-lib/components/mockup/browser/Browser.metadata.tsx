import { ComponentMetadata } from "../../types.ts";
import { BrowserMockup } from "./BrowserMockup.tsx";

export const browserMetadata: ComponentMetadata = {
  name: "Browser",
  description: "Browser window mockup",
  category: "Mockup",
  path: "/components/mockup/browser",
  tags: ["browser", "mockup", "window", "frame", "demo", "showcase"],
  examples: ["basic", "with-toolbar", "with-url", "dark", "responsive"],
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
